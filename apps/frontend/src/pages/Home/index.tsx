import {
  CreateGameModal,
  JoinGameModal,
} from '@gol-ya-pooch/frontend/components';
import { Trans, useTranslation } from 'react-i18next';

import CircleIcon from './assets/circle-icon.svg';
import FlowerIcon from './assets/flower-icon.svg';
import NineIcon from './assets/nine-icon.svg';
import StairsIcon from './assets/stairs-icon.svg';

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div className="text-center rtl-dir:direction-rtl ltr-dir:direction-ltr">
      <div className="absolute -top-32 w-56 h-56 rotate-45 rounded-[40px] bg-gradient-to-br from-[#201A32] to-[rgba(32, 26, 50, 0)] translate-x-1/2 right-1/2" />
      <div className="opacity-15 -z-10">
        <FlowerIcon className="absolute top-[8%] left-[10%] animate-move-top-left" />
        <NineIcon className="absolute top-[10%] right-[10%] animate-move-top-right" />
        <CircleIcon className="absolute bottom-[12%] left-[15%] animate-move-bottom-left" />
        <StairsIcon className="absolute bottom-[10%] right-[15%] animate-move-bottom-right" />
      </div>
      <h1 className="font-extra-black text-7xl text-primary">
        <Trans
          i18nKey="home.title"
          components={{ lighter: <span className="text-primary-50" /> }}
        />
      </h1>
      <span className="font-extra-bold text-l text-purple-white mt-8 block">
        {t('home.description')}
      </span>
      <div className="mt-24">
        <JoinGameModal />
        <CreateGameModal />
      </div>
    </div>
  );
};

export default HomePage;
