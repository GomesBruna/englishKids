import { Star } from 'lucide-react';

interface ProgressBarProps {
  current: number;
  total: number;
  score: number;
}

export const ProgressBar = ({ current, total, score }: ProgressBarProps) => {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-600 font-medium">
          Progresso: {current} / {total}
        </span>
        <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className="font-bold text-yellow-700">{score}</span>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
        <div
          className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
