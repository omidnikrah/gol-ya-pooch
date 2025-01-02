import { useToast } from '@gol-ya-pooch/frontend/components';
import { GamePhases, Toasts } from '@gol-ya-pooch/frontend/enums';
import {
  useGameStore,
  useMessagesStore,
  usePlayerStore,
} from '@gol-ya-pooch/frontend/stores';
import { isItemInArray } from '@gol-ya-pooch/frontend/utils';
import {
  Events,
  FinishGamePayload,
  HandPosition,
  IObjectLocation,
  Player,
  PlayerFillHand,
  PublicGameState,
} from '@gol-ya-pooch/shared';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'wouter';

import { useKeyPress, useSocket, useSound } from '.';

const SIX_PLAYERS_GAME_SIZE = 6;

export const useGameControls = () => {
  const params = useParams();
  const {
    phase,
    gameState,
    requestedPlayerIdToEmptyPlay,
    setGameState,
    setPlayingPlayerId,
    setRequestedPlayerIdToEmptyPlay,
    setGamePhase,
    setFinishGameResult,
    setHandFillingData,
    setEmptyHand,
    resetEmptyHands,
  } = useGameStore();
  const { player, setObjectLocation } = usePlayerStore();
  const { setMessage } = useMessagesStore();
  const { emit, on, off } = useSocket();
  const { showToast, dismissToastByName } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const targetFillHandData = useRef<{
    toPlayerId: string;
    hand: HandPosition;
  } | null>();
  const filledHands = useRef<string[]>([]);
  const { play: playNotificationSound } = useSound('/sounds/notification.mp3');
  const { play: playBuzzSound } = useSound('/sounds/buzz.mp3');
  const { play: playEmptyPlayingSound } = useSound('/sounds/empty-playing.mp3');
  const { play: playClappingSound } = useSound('/sounds/clapping.mp3');

  const handleSpreadObject = (hand: HandPosition) => {
    if (gameState?.gameMaster === player?.id && player && gameState) {
      const teamMembers = gameState?.teams[player.team].members;
      const gameSize = gameState?.gameSize;
      const isSixPlayersGame = gameSize === SIX_PLAYERS_GAME_SIZE;
      const playerSiblingsInfo = isItemInArray(teamMembers!, 'id', player.id);
      let toPlayerId = '';

      dismissToastByName(Toasts.SPREAD_OBJECT);

      switch (hand) {
        case 'left':
          if (playerSiblingsInfo.hasLeft) {
            toPlayerId =
              gameState.teams[player.team].members[isSixPlayersGame ? 2 : 1].id;
          }
          break;
        case 'right':
          if (playerSiblingsInfo.hasRight) {
            toPlayerId = gameState.teams[player.team].members[0].id;
          }
          break;
      }

      if (!filledHands.current.includes(toPlayerId)) {
        targetFillHandData.current = {
          toPlayerId,
          hand: hand,
        };

        filledHands.current = [...filledHands.current, toPlayerId];

        emit(Events.PLAYER_FILL_HAND, {
          gameId: gameState.gameId,
          fromPlayerId: player?.id,
          toPlayerId,
          direction: hand,
          filledHands: filledHands.current,
        });
      } else {
        showToast('دست این بازیکن رو پر کردی');
      }
    }
  };

  const handleEmitPlaying = (hand: HandPosition) => {
    if (
      requestedPlayerIdToEmptyPlay === player?.id &&
      phase === GamePhases.PLAYING
    ) {
      playEmptyPlayingSound();
      setIsPlaying(true);

      setTimeout(() => {
        setIsPlaying(false);
      }, 4000);

      dismissToastByName(Toasts.REQUESTED_EMPTY_PLAY);

      emit(Events.PLAYER_PLAYING, {
        playerId: player?.id,
        gameId: gameState?.gameId,
      });

      if (player?.objectLocation) {
        setObjectLocation({
          playerId: player.id,
          hand,
        });
        emit(Events.CHANGE_OBJECT_LOCATION, {
          playerId: player?.id,
          gameId: gameState?.gameId,
          hand,
        });
      }
    }

    if (phase === GamePhases.SPREADING_OBJECT) {
      handleSpreadObject(hand);
    }
  };

  useKeyPress('ArrowLeft', () => {
    handleEmitPlaying('left');
  });

  useKeyPress('ArrowRight', () => {
    handleEmitPlaying('right');
  });

  useKeyPress('Space', () => {
    if (
      phase === GamePhases.SPREADING_OBJECT &&
      gameState?.gameMaster === player?.id &&
      targetFillHandData.current
    ) {
      setObjectLocation(null);
      emit(Events.CHANGE_OBJECT_LOCATION, {
        playerId: targetFillHandData.current.toPlayerId,
        gameId: gameState?.gameId,
        hand: targetFillHandData.current.hand,
      });
      targetFillHandData.current = null;
    }
  });

  useEffect(() => {
    if (requestedPlayerIdToEmptyPlay === player?.id && !isPlaying) {
      playNotificationSound();
      showToast(
        'شما باید خالی بازی کنید',
        5000,
        true,
        Toasts.REQUESTED_EMPTY_PLAY,
      );
    }
  }, [requestedPlayerIdToEmptyPlay, player, isPlaying]);

  useEffect(() => {
    on(Events.GAME_STATE_UPDATED, (data: PublicGameState) => {
      setGameState(data);
    });

    on(Events.PLAYER_RECEIVE_OBJECT, (objectLocation: IObjectLocation) => {
      showToast('گل اومد دستت.', 5000);
      setObjectLocation(objectLocation);
    });

    on(
      Events.GUESS_LOCATION_RESULT,
      (data: {
        gameState: PublicGameState;
        isGuessCorrect: boolean;
        isFromEmptyHand: boolean;
        oldObjectLocation: IObjectLocation;
      }) => {
        if (data.isGuessCorrect) {
          showToast('حدس گل درست بود 🎉', 5000);
        } else {
          playBuzzSound();
          showToast(
            data.isFromEmptyHand ? 'گل رو پوچ کردی!' : 'دست گل نبود',
            5000,
          );

          const persianHandPosition =
            data.oldObjectLocation.hand === 'left' ? 'چپ' : 'راست';

          setMessage({
            playerId: data.oldObjectLocation.playerId,
            message: `گل دست ${persianHandPosition} من بود 😎`,
          });
        }

        if (data.gameState.gameSize > 2) {
          resetEmptyHands();
          setGamePhase(GamePhases.SPREADING_OBJECT);
          filledHands.current = [];
          targetFillHandData.current = null;
        }

        setObjectLocation(null);
        setGameState(data.gameState);
      },
    );

    on(
      Events.GAME_FINISHED,
      ({ data }: { data: FinishGamePayload; isGuessCorrect: boolean }) => {
        playClappingSound();
        setGamePhase(GamePhases.GAME_FINISHED);
        setFinishGameResult(data);
      },
    );

    on(Events.REACH_EMPTY_PLAYS_LIMIT, (data: { message: string }) => {
      showToast(data.message, 3000);
    });

    return () => {
      off(Events.GAME_STATE_UPDATED);
      off(Events.PLAYER_RECEIVE_OBJECT);
      off(Events.GUESS_LOCATION_RESULT);
      off(Events.REACH_EMPTY_PLAYS_LIMIT);
    };
  }, []);

  useEffect(() => {
    if (phase === GamePhases.SPREADING_OBJECT) {
      if (player?.id === gameState?.gameMaster) {
        showToast('اوستا گل رو پخش کن', 5000, true, Toasts.SPREAD_OBJECT);
      } else {
        showToast(
          'وایسا اوستا گل رو پخش کنه',
          5000,
          true,
          Toasts.WAITING_FOR_SPREAD_OBJECT,
        );
      }
    }
  }, [phase, player?.id, gameState?.gameMaster]);

  useEffect(() => {
    on(Events.PLAYER_FILL_HAND, (data: PlayerFillHand) => {
      setHandFillingData(data);
      filledHands.current = data.filledHands;
      setTimeout(() => {
        setHandFillingData(null);

        if (
          gameState &&
          filledHands.current.length + 1 === gameState.gameSize / 2
        ) {
          setGamePhase(GamePhases.PLAYING);
          filledHands.current = [];
          targetFillHandData.current = null;
          dismissToastByName(Toasts.WAITING_FOR_SPREAD_OBJECT);
        }
      }, 10000);
    });

    return () => {
      off(Events.PLAYER_FILL_HAND);
    };
  }, [gameState]);

  useEffect(() => {
    emit(Events.GET_ROOM_INFO, {
      gameId: params.gameId,
    });

    on(Events.ROOM_INFO_FETCHED, (data: PublicGameState) => {
      setGameState(data);
    });

    on(Events.REQUEST_EMPTY_PLAY, (playerId: Player['id']) => {
      setRequestedPlayerIdToEmptyPlay(playerId);
    });

    on(
      Events.PLAYER_EMPTY_HAND,
      (data: { playerId: Player['id']; hand: HandPosition }) => {
        setEmptyHand(data.playerId, data.hand);
      },
    );

    on(Events.PLAYER_PLAYING, (playerId: Player['id']) => {
      setPlayingPlayerId(playerId);
    });

    return () => {
      off(Events.ROOM_INFO_FETCHED);
      off(Events.REQUEST_EMPTY_PLAY);
      off(Events.PLAYER_PLAYING);
    };
  }, [params.gameId]);

  return null;
};
