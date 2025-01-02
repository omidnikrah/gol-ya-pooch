import {
  useEmptyHand,
  useGuessHand,
  useRequestEmptyPlay,
} from '@gol-ya-pooch/frontend/hooks';
import { useGameStore } from '@gol-ya-pooch/frontend/stores';
import { HandPosition } from '@gol-ya-pooch/shared';
import { useTranslation } from 'react-i18next';

import { usePlayerContext } from './PlayerContext';

export const PlayerActionButtons = () => {
  const { gameState, emptyHands } = useGameStore();
  const { data } = usePlayerContext();
  const { requestEmptyPlay } = useRequestEmptyPlay();
  const { guessObjectLocation } = useGuessHand();
  const { requestEmptyHand } = useEmptyHand();
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const shouldPlayerEmptyHand = !!emptyHands?.[data!.id];
  const playerEmptyHandPosition = shouldPlayerEmptyHand
    ? emptyHands[data!.id]
    : '';

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

  const handleEmptyHand = (position: HandPosition | 'both') => {
    requestEmptyHand(data!.id, position);
  };

  if (!gameState) return null;

  return (
    <>
      <div className="z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col w-[310px] absolute siblings-container pointer-events-none">
        {gameState.gameSize > 2 && (
          <div className="z-10 absolute top-0 flex shrink-0 opacity-0 group-hover:opacity-100 transition-opacity -translate-y-12 gap-1 siblings-container">
            <button
              type="button"
              className="relative flex items-center justify-center appearance-none border-none border-0 hover:scale-110 transition-all hover:!opacity-100 sibling-item cursor-pointer pointer-events-auto disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:!opacity-20 disabled:!opacity-20"
              onClick={() => handleEmptyHand('left')}
              disabled={playerEmptyHandPosition === 'left'}
            >
              <img src="/images/btn-shape-right.svg" alt="" />
              <span className="absolute -mt-1.5 text-white font-bold text-sm">
                {t('left_hand_empty')}
              </span>
            </button>
            <button
              type="button"
              className="relative flex items-center justify-center appearance-none border-none border-0 hover:scale-110 transition-all hover:!opacity-100 sibling-item cursor-pointer pointer-events-auto disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:!opacity-20 disabled:!opacity-20"
              onClick={() => handleEmptyHand('both')}
              disabled={shouldPlayerEmptyHand}
            >
              <img src="/images/btn-shape-center.svg" alt="" />
              <span className="absolute -mt-1.5 text-white font-bold text-sm">
                {t('both_hands_empty')}
              </span>
            </button>
            <button
              type="button"
              className="relative flex items-center justify-center appearance-none border-none border-0 hover:scale-110 transition-all hover:!opacity-100 sibling-item cursor-pointer pointer-events-auto disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:!opacity-20 disabled:!opacity-20"
              onClick={() => handleEmptyHand('right')}
              disabled={playerEmptyHandPosition === 'right'}
            >
              <img src="/images/btn-shape-left.svg" alt="" />
              <span className="absolute -mt-1.5 text-white font-bold text-sm">
                {t('right_hand_empty')}
              </span>
            </button>
          </div>
        )}
        <div className="w-full flex justify-between pointer-events-none">
          <button
            type="button"
            className="rounded-full appearance-none border-none border-0 hover:scale-110 transition-all hover:!opacity-100 sibling-item pointer-events-auto disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:!opacity-20 disabled:!opacity-20"
            onClick={() => handleGuessObject('left')}
            disabled={playerEmptyHandPosition === 'left'}
          >
            <img src={`/images/${language}-left-gol-btn.svg`} alt="" />
          </button>
          <button
            type="button"
            className="rounded-full appearance-none border-none border-0 hover:scale-110 transition-all hover:!opacity-100 sibling-item pointer-events-auto disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:!opacity-20 disabled:!opacity-20"
            onClick={() => handleGuessObject('right')}
            disabled={playerEmptyHandPosition === 'right'}
          >
            <img src={`/images/${language}-right-gol-btn.svg`} alt="" />
          </button>
        </div>
        <button
          type="button"
          className="rounded-full appearance-none border-none border-0 translate-y-[-29px] hover:scale-110 transition-all hover:!opacity-100 sibling-item pointer-events-auto disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:!opacity-20 disabled:!opacity-20"
          onClick={handleRequestEmptyPlay}
          disabled={shouldPlayerEmptyHand}
        >
          <img src={`/images/${language}-empty-play-btn.svg`} alt="" />
        </button>
      </div>
    </>
  );
};
