import { useToast } from '@gol-ya-pooch/frontend/components';
import { useGameStore, usePlayerStore } from '@gol-ya-pooch/frontend/stores';
import {
  Events,
  HandPosition,
  IObjectLocation,
  PublicGameState,
} from '@gol-ya-pooch/shared';
import { useEffect } from 'react';

import { useKeyPress, useSocket } from '.';

export const useGameControls = () => {
  const { gameState, requestedPlayerIdToEmptyPlay, setGameState } =
    useGameStore();
  const { player, setObjectLocation } = usePlayerStore();
  const { emit, on, off } = useSocket();
  const { showToast } = useToast();

  const handleEmitPlaying = (hand: HandPosition) => {
    if (requestedPlayerIdToEmptyPlay === player?.id) {
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
    if (requestedPlayerIdToEmptyPlay === player?.id) {
      showToast('شما باید خالی بازی کنید', 5000);
    }
  }, [requestedPlayerIdToEmptyPlay, player]);

  useEffect(() => {
    on(Events.GAME_STATE_UPDATED, (data: PublicGameState) => {
      setGameState(data);
    });

    on(Events.PLAYER_RECEIVE_OBJECT, (objectLocation: IObjectLocation) => {
      setObjectLocation(objectLocation);
    });

    return () => {
      off(Events.GAME_STATE_UPDATED);
    };
  }, []);

  return null;
};
