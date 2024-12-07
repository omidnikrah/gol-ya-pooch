import { useToast } from '@gol-ya-pooch/frontend/components';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

export const ShareGameLinkAlert = () => {
  const [isShowing, setIsShowing] = useState(true);
  const { showToast } = useToast();

  const handleCopyGameRoomLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    showToast('لینک بازی کپی شد.');
  };

  if (!isShowing) return null;

  return (
    <div className="fixed bottom-5 right-5 bg-white rounded-2xl p-6 flex flex-col gap-8">
      <div className="flex flex-row justify-between items-center">
        <span>لینک بازی رو بفرست برای دوستات تا جوین بشن به بازی 😎</span>
        <button
          type="button"
          onClick={() => {
            setIsShowing(false);
          }}
        >
          <XMarkIcon width={24} height={24} />
        </button>
      </div>
      <div className="relative rounded-full bg-gray-200 flex items-center overflow-hidden">
        <span className="px-4 py-2 flex text-sm font-light">
          {window.location.href}
        </span>
        <div className="absolute right-1 bg-[linear-gradient(90deg,_rgba(229,231,235,0)_0%,_rgba(229,231,235,1)_100%)] h-full w-full flex items-center">
          <button
            className="bg-white text-purple-80 px-[8px] py-[4px] rounded-full text-sm font-medium"
            type="button"
            onClick={handleCopyGameRoomLink}
          >
            کپی لینک
          </button>
        </div>
      </div>
    </div>
  );
};
