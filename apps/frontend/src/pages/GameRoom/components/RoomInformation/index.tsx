import { useGameStore } from '@gol-ya-pooch/frontend/stores';
import { convertToPersianNumbers } from '@gol-ya-pooch/frontend/utils';
import clsx from 'clsx';
import { Trans, useTranslation } from 'react-i18next';

export const RoomInformation = () => {
  const { gameState } = useGameStore();
  const {
    t,
    i18n: { language },
  } = useTranslation();

  if (!gameState) return null;

  const teamAScores = gameState?.scores?.teamA || 0;
  const teamBScores = gameState?.scores?.teamB || 0;

  return (
    <div className="fixed top-5 right-5 bg-white rounded-2xl p-4 flex items-center flex-col gap-3 ltr-dir:direction-ltr">
      {gameState?.currentTurn && (
        <span className="text-sm font-medium text-purple-80">
          <Trans
            i18nKey="room_info.object_holder_team"
            values={{
              teamColor: t(
                gameState.currentTurn === 'teamA' ? 'teamAColor' : 'teamBColor',
              ),
            }}
            components={{
              teamColor: (
                <span
                  className={clsx('font-bold', {
                    'text-blue-team': gameState.currentTurn === 'teamA',
                    'text-red-team': gameState.currentTurn === 'teamB',
                  })}
                />
              ),
            }}
          />
        </span>
      )}
      <span className="text-sm text-purple-80/90">
        <Trans
          i18nKey="room_info.game_round.title"
          values={{
            gameRound:
              language === 'fa'
                ? convertToPersianNumbers(gameState.round)
                : gameState.round,
          }}
          components={{
            bold: <span className="font-bold text-purple-80" />,
          }}
        />
      </span>
      <span className="w-full h-px bg-purple-80/10" />
      <div className="flex flex-row items-center">
        <div className="flex flex-row px-2 items-center gap-2">
          <img className="size-12" src="/images/team-a-hands.png" alt="" />
          <span className="text-purple-80">
            {language === 'fa'
              ? convertToPersianNumbers(teamAScores)
              : teamAScores}
          </span>
        </div>
        <span className="w-3 h-[2px] bg-purple-80 rounded-full" />
        <div className="flex flex-row-reverse px-2 items-center gap-2">
          <img className="size-12" src="/images/team-b-hands.png" alt="" />
          <span className="text-purple-80">
            {language === 'fa'
              ? convertToPersianNumbers(teamBScores)
              : teamBScores}
          </span>
        </div>
      </div>
    </div>
  );
};
