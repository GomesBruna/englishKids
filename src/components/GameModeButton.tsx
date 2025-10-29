import { LucideIcon } from 'lucide-react';

interface GameModeButtonProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
}

export const GameModeButton = ({ icon: Icon, title, description, color, onClick }: GameModeButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`${color} p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-white group`}
    >
      <Icon className="w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform" />
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-white/90">{description}</p>
    </button>
  );
};
