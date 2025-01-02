import { useTranslation } from 'react-i18next';

export const MobileBanner = () => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-purple-80 p-6 flex items-center justify-center md:hidden">
      <h3 className="text-white text-center">{t('mobile_banner.message')}</h3>
    </div>
  );
};
