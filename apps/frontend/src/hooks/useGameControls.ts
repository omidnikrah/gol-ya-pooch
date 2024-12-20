import { useToast } from '@gol-ya-pooch/frontend/components';
import { GamePhases, Toasts } from '@gol-ya-pooch/frontend/enums';
import { useGameStore, usePlayerStore } from '@gol-ya-pooch/frontend/stores';
import {
  Events,
  FinishGamePayload,
  HandPosition,
  IObjectLocation,
  Player,
  PublicGameState,
} from '@gol-ya-pooch/shared';
import { useEffect, useState } from 'react';
import { useParams } from 'wouter';

import { useKeyPress, useSocket, useSound } from '.';

export const useGameControls = () => {
  const params = useParams();
  const {
    gameState,
    requestedPlayerIdToEmptyPlay,
    setGameState,
    setPlayingPlayerId,
    setRequestedPlayerIdToEmptyPlay,
    setGamePhase,
    setFinishGameResult,
  } = useGameStore();
  const { player, setObjectLocation } = usePlayerStore();
  const { emit, on, off } = useSocket();
  const { showToast, dismissToastByName } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const { play: playNotificationSound } = useSound('/sounds/notification.mp3');
  const { play: playBuzzSound } = useSound('/sounds/buzz.mp3');
  const { play: playEmptyPlayingSound } = useSound('/sounds/empty-playing.mp3');
  const { play: playClappingSound } = useSound('/sounds/clapping.mp3');

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
  };

  useKeyPress('ArrowLeft', () => {
    handleEmitPlaying('left');
  });

  useKeyPress('ArrowRight', () => {
    handleEmitPlaying('right');
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
