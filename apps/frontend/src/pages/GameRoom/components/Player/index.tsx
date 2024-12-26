import { GamePhases } from '@gol-ya-pooch/frontend/enums';
import {
  useGuessHand,
  useRequestEmptyPlay,
} from '@gol-ya-pooch/frontend/hooks';
import { useGameStore, usePlayerStore } from '@gol-ya-pooch/frontend/stores';
import {
  HandPosition,
  Player as IPlayerData,
  TeamNames,
} from '@gol-ya-pooch/shared';
import Spline from '@splinetool/react-spline';
import clsx from 'clsx';
import { useMemo } from 'react';

interface IPlayer {
  team: TeamNames;
  data: IPlayerData | null;
  isJoined: boolean;
  position: 'top' | 'bottom';
}

export const Player = ({ team, data, isJoined, position }: IPlayer) => {
  const { playingPlayerId, gameState, phase, handFillingData } = useGameStore();
  const { player } = usePlayerStore();
  const { requestEmptyPlay } = useRequestEmptyPlay();
  const { guessObjectLocation } = useGuessHand();

  const isPlaying = playingPlayerId === data?.id;
  const phasesToShowReadyBadge = [
    GamePhases.WAITING_FOR_PLAYERS,
    GamePhases.WAITING_FOR_READY,
  ];

  const handleRequestEmptyPlay = () => {
    if (data?.id) {
      requestEmptyPlay(data?.id);
    }
  };

  const handleGuessObject = (hand: HandPosition) => {
    if (data?.id) {
      guessObjectLocation(data?.id, hand);
    }
  };

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

    return `/models/${team === 'teamA' ? 'blue' : 'red'}-${position}-team-hands${isPlaying ? '-playing' : ''}${shouldHandsOpen ? '-open' : ''}${shouldShowFillingHand ? `-fill-${fillingHandDirection}` : ''}.splinecode`;
  }, [team, position, isPlaying, gameState, phase, handFillingData]);

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
    <div
      data-id={data?.id}
      className={clsx(
        'group w-full h-1/2 bg-purple-80 aspect-square relative flex justify-center',
        {
          'rounded-tr-full rounded-tl-full items-end': position === 'bottom',
          'rounded-br-full rounded-bl-full items-start': position === 'top',
        },
      )}
    >
      {data?.isReady && phasesToShowReadyBadge.includes(phase) && (
        <span
          className={clsx(
            'absolute translate-x-1/2 right-1/2 bg-green-300 text-green-800 px-4 py-1 rounded-full',
            {
              'translate-y-14': position === 'bottom',
              '-translate-y-14': position === 'top',
            },
          )}
        >
          آماده
        </span>
      )}
      {player?.id && player?.id === data?.id && (
        <span className="absolute translate-x-1/2 right-1/2 bg-purple-80 text-white px-4 py-1 rounded-full translate-y-24">
          شما
        </span>
      )}
      {data?.name}
      {isJoined && (
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
      )}
      {gameState?.currentTurn === team && position !== 'bottom' && (
        <div className="z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col w-[310px] absolute siblings-container pointer-events-none">
          <div className="w-full flex justify-between pointer-events-none">
            <button
              type="button"
              className="rounded-full appearance-none border-none border-0 hover:scale-110 transition-all hover:!opacity-100 sibling-item pointer-events-auto"
              onClick={() => handleGuessObject('left')}
            >
              <img src="/images/left-gol-btn.svg" alt="" />
            </button>
            <button
              type="button"
              className="rounded-full appearance-none border-none border-0 hover:scale-110 transition-all hover:!opacity-100 sibling-item pointer-events-auto"
              onClick={() => handleGuessObject('right')}
            >
              <img src="/images/right-gol-btn.svg" alt="" />
            </button>
          </div>
          <button
            type="button"
            className="rounded-full appearance-none border-none border-0 translate-y-[-29px] hover:scale-110 transition-all hover:!opacity-100 sibling-item pointer-events-auto"
            onClick={handleRequestEmptyPlay}
          >
            <img src="/images/empty-play-btn.svg" alt="" />
          </button>
        </div>
      )}
    </div>
  );
};
