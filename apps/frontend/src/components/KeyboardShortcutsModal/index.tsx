import { useLocalStorage } from '@gol-ya-pooch/frontend/hooks';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  MinusIcon,
} from '@heroicons/react/16/solid';

export const KeyboardShortcutsModal = () => {
  const [isModalShown, setIsModalShown] = useLocalStorage<boolean>(
    'isKeyboardShortcutsModalShown',
    false,
  );

  if (isModalShown) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#351351] bg-opacity-60 backdrop-blur-sm z-20">
      <div className="w-[450px] p-8 bg-purple-80 rounded-2xl text-center flex flex-col gap-4">
        <h3 className="font-black text-xl text-primary">راهنمای بازی</h3>
        <div className="inline-flex shrink-0 rounded-full p-1 flex-col">
          <span className="text-white text-sm">
            برای پخش کردن گل و خالی بازی کردن باید از Arrow Keyهای کیبورد
            استفاده کنی:
          </span>
          <div className="my-14 flex flex-row items-center justify-center gap-5">
            <div className="size-14 rounded-lg shadow-[0_3px_0_2px_#adadad] bg-[#e7e7e7] p-2 inline-flex items-center justify-center">
              <ArrowRightIcon
                width={36}
                height={36}
                className="fill-purple-80"
              />
            </div>
            <div className="size-14 rounded-lg shadow-[0_3px_0_2px_#adadad] bg-[#e7e7e7] p-2 inline-flex items-center justify-center">
              <ArrowLeftIcon
                width={36}
                height={36}
                className="fill-purple-80"
              />
            </div>
          </div>
        </div>
        <div className="inline-flex shrink-0 rounded-full p-1 flex-col">
          <span className="text-white text-sm">
            اگر اوستا بودی و موقع پخش گل خواستی گل رو بدی به بازیکن، باید دکمه
            Space کیبوردت رو بزنی:
          </span>
          <div className="my-14 flex flex-row items-center justify-center gap-5">
            <div className="h-14 w-full rounded-lg shadow-[0_3px_0_2px_#adadad] bg-[#e7e7e7] p-2 inline-flex items-center justify-center">
              <MinusIcon
                width={36}
                height={36}
                className="fill-purple-80 mt-4"
              />
            </div>
          </div>
        </div>
        <div>
          <button
            className="px-8 py-2 bg-gray-300 text-gray-600 rounded-full mr-2 hover:bg-primary transition-all hover:text-white"
            type="button"
            onClick={() => setIsModalShown(true)}
          >
            ایول، فهمیدم!
          </button>
        </div>
      </div>
    </div>
  );
};
