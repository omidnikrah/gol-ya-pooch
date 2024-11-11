import Spline from '@splinetool/react-spline';

export const Player = () => {
  return (
    <div className="w-full h-1/2 rounded-tr-full rounded-tl-full bg-purple-80 aspect-square relative flex items-end">
      <Spline
        scene="/models/blue-team-hands.splinecode"
        className="absolute flex justify-center !h-[120px] translate-y-6"
      />
    </div>
  );
};
