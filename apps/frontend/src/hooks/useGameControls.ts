import { useToast } from '@gol-ya-pooch/frontend/components';
import { GamePhases, Toasts } from '@gol-ya-pooch/frontend/enums';
import { useGameStore, usePlayerStore } from '@gol-ya-pooch/frontend/stores';
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
  } = useGameStore();
  const { player, setObjectLocation } = usePlayerStore();
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
        });
      } else {
        showToast('دست این بازیکن رو پر کردی');
      }
    }
  };

  const handleEmitPlaying = (hand: HandPosition) => {
    if (requestedPlayerIdToEmptyPlay === player?.id) {
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
      showToast('توپ اومد دستت.', 5000);
      setObjectLocation(objectLocation);
    });

    on(
      Events.GUESS_LOCATION_RESULT,
      (data: { gameState: PublicGameState; isGuessCorrect: boolean }) => {
        if (data.isGuessCorrect) {
          showToast('حدس گل درست بود 🎉', 5000);
        } else {
          playBuzzSound();
          showToast('دست گل نبود', 5000);
        }
        setGameState(data.gameState);

        if (data.gameState.gameSize > 2) {
          setGamePhase(GamePhases.SPREADING_OBJECT);
          filledHands.current = [];
          targetFillHandData.current = null;
        }
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

    return () => {
      off(Events.GAME_STATE_UPDATED);
      off(Events.PLAYER_RECEIVE_OBJECT);
      off(Events.GUESS_LOCATION_RESULT);
    };
  }, []);

  useEffect(() => {
    on(Events.PLAYER_FILL_HAND, (data: PlayerFillHand) => {
      setHandFillingData(data);
      setTimeout(() => {
        setHandFillingData(null);

        if (
          gameState &&
          filledHands.current.length + 1 === gameState.gameSize / 2
        ) {
          setGamePhase(GamePhases.PLAYING);
          filledHands.current = [];
          targetFillHandData.current = null;
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
