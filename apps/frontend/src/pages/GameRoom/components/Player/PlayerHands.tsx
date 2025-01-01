import { GamePhases } from '@gol-ya-pooch/frontend/enums';
import { useGameStore } from '@gol-ya-pooch/frontend/stores';
import { HandPosition } from '@gol-ya-pooch/shared';
import Spline from '@splinetool/react-spline';
import clsx from 'clsx';
import { useMemo } from 'react';

import { usePlayerContext } from './PlayerContext';

export const PlayerHands = () => {
  const { team, position, data } = usePlayerContext();
  const { playingPlayerId, gameState, phase, handFillingData, emptyHands } =
    useGameStore();
  const isPlaying = playingPlayerId === data?.id;

  const splineFilePath = useMemo(() => {
    const shouldHandsOpen =
      !gameState?.currentTurn || team !== gameState?.currentTurn;

    const shouldShowFillingHand =
      phase === GamePhases.SPREADING_OBJECT &&
      !shouldHandsOpen &&
      [handFillingData?.fromPlayerId, handFillingData?.toPlayerId].includes(
        data?.id,
      );

    let fillingHandDirection = '';

    if (shouldShowFillingHand) {
      const isTargetPlayer = data?.id === handFillingData?.toPlayerId;
      const isDirectionLeft = handFillingData?.direction === 'left';

      fillingHandDirection =
        isTargetPlayer === isDirectionLeft ? 'right' : 'left';
    }

    const shouldPlayerEmptyHand = !!emptyHands?.[data!.id];
    const playerEmptyHandPosition = shouldPlayerEmptyHand
      ? emptyHands[data!.id]
      : '';

    return `/models/${team === 'teamA' ? 'blue' : 'red'}-${position}-team-hands${isPlaying ? '-playing' : ''}${shouldHandsOpen ? '-open' : ''}${shouldShowFillingHand ? `-fill-${fillingHandDirection}` : ''}${shouldPlayerEmptyHand ? `-empty-${playerEmptyHandPosition}` : ''}.splinecode`;
  }, [
    team,
    position,
    isPlaying,
    gameState,
    phase,
    handFillingData,
    emptyHands,
  ]);

  const transformXValue = useMemo(() => {
    const shouldHandsOpen =
      !gameState?.currentTurn || team !== gameState?.currentTurn;

    const shouldShowFillingHand =
      phase === GamePhases.SPREADING_OBJECT &&
      !shouldHandsOpen &&
      [handFillingData?.fromPlayerId, handFillingData?.toPlayerId].includes(
        data?.id,
      );

    if (!shouldShowFillingHand) {
      return {
        shouldShowFillingHand,
        value: '',
      };
    }

    const getFillingHandDirection = () => {
      const { direction, toPlayerId } = handFillingData || {};
      const isToPlayer = data?.id === toPlayerId;

      if (direction === 'left') {
        return isToPlayer ? 'right' : 'left';
      } else {
        return isToPlayer ? 'left' : 'right';
      }
    };

    const fillingHandDirection = getFillingHandDirection();

    const getTransformValue = (
      direction: HandPosition,
      pos: 'top' | 'bottom',
    ) => {
      const transformMap = {
        'left-bottom': '-translate-x-2.5',
        'left-top': 'translate-x-5',
        'right-bottom': 'translate-x-2.5',
        'right-top': '-translate-x-5',
      };

      return transformMap[`${direction}-${pos}`] || '';
    };

    return {
      shouldShowFillingHand,
      value: getTransformValue(fillingHandDirection, position),
    };
  }, [team, position, handFillingData, gameState]);

  return (
    <Spline
      scene={splineFilePath}
      style={{
        overflow: 'visible clip',
      }}
      className={clsx(
        'absolute flex justify-center !h-[120px] transition-transform z-10',
        {
          'translate-y-6': position === 'bottom',
          '-translate-y-6': position === 'top',
          [transformXValue.value]: transformXValue.shouldShowFillingHand,
        },
      )}
    />
  );
};
