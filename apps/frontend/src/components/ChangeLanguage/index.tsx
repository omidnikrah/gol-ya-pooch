import { useLocalStorage } from '@gol-ya-pooch/frontend/hooks';
import { LanguageIcon } from '@heroicons/react/24/solid';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const ChangeLanguage = () => {
  const { i18n } = useTranslation();
  const [persistedLanguage, setPersistedLanguage] = useLocalStorage<string>(
    'lang',
    i18n.language,
  );

  useEffect(() => {
    if (persistedLanguage) {
      i18n.changeLanguage(persistedLanguage);
    }
  }, [persistedLanguage]);

  useEffect(() => {
    document.documentElement.lang = i18n.language;

    const handleLanguageChange = (lng: string) => {
      document.documentElement.lang = lng;
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const handleChangeLanguage = (targetLanguage: 'fa' | 'en') => {
    i18n.changeLanguage(targetLanguage);
    setPersistedLanguage(targetLanguage);
  };

  return (
    <div className="absolute top-5 left-14 group">
      <span className="bg-white rounded-full p-1 flex">
        <LanguageIcon width={16} height={16} />
      </span>
      <div className="bg-white p-1 rounded-lg flex flex-col gap-1 absolute left-0 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-1 transition-all">
        <button
          type="button"
          className="px-2 py-1 rounded-md appearance-none hover:bg-primary hover:text-white text-sm transition-colors"
          onClick={() => handleChangeLanguage('fa')}
        >
          Persian
        </button>
        <button
          type="button"
          className="px-2 py-1 rounded-md appearance-none hover:bg-primary hover:text-white text-sm transition-colors"
          onClick={() => handleChangeLanguage('en')}
        >
          English
        </button>
      </div>
    </div>
  );
};
