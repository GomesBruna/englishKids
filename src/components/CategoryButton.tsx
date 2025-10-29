import { LucideIcon } from 'lucide-react';

interface CategoryButtonProps {
  icon: LucideIcon;
  label: string;
  color: string;
  onClick: () => void;
  isActive: boolean;
}

export const CategoryButton = ({ icon: Icon, label, color, onClick, isActive }: CategoryButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
        isActive
          ? `${color} shadow-lg scale-105`
          : 'bg-white border-2 border-gray-200 hover:border-gray-300'
      }`}
    >
      <Icon className={`w-12 h-12 mb-3 ${isActive ? 'text-white' : 'text-gray-700'}`} />
      <span className={`text-lg font-semibold ${isActive ? 'text-white' : 'text-gray-700'}`}>
        {label}
      </span>
    </button>
  );
};
