import { useToast } from '@gol-ya-pooch/frontend/components';
import { useGameStore, usePlayerStore } from '@gol-ya-pooch/frontend/stores';
import {
  Events,
  HandPosition,
  IObjectLocation,
  Player,
  PublicGameState,
} from '@gol-ya-pooch/shared';
import { useEffect, useState } from 'react';
import { useParams } from 'wouter';

import { useKeyPress, useSocket } from '.';

export const useGameControls = () => {
  const params = useParams();
  const {
    gameState,
    requestedPlayerIdToEmptyPlay,
    setGameState,
    setPlayingPlayerId,
    setRequestedPlayerIdToEmptyPlay,
  } = useGameStore();
  const { player, setObjectLocation } = usePlayerStore();
  const { emit, on, off } = useSocket();
  const { showToast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleEmitPlaying = (hand: HandPosition) => {
    if (requestedPlayerIdToEmptyPlay === player?.id) {
      setIsPlaying(true);

      setTimeout(() => {
        setIsPlaying(false);
      }, 4000);

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
      showToast('شما باید خالی بازی کنید', 5000);
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
          showToast('دست گل نبود', 5000);
        }
        setGameState(data.gameState);
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
