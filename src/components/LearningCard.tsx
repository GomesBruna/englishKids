import { Volume2, Check } from 'lucide-react';
import { LearningItem } from '../lib/supabase';
import { speak } from '../utils/speech';
import { useState } from 'react';

interface LearningCardProps {
  item: LearningItem;
  onComplete: () => void;
}

export const LearningCard = ({ item, onComplete }: LearningCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCheck, setShowCheck] = useState(false);

  const handleSpeak = () => {
    speak(item.audio_text);
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      handleSpeak();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  const handleComplete = () => {
    setShowCheck(true);
    setTimeout(() => {
      setShowCheck(false);
      setIsFlipped(false);
      onComplete();
    }, 800);
  };

  return (
    <div className="relative w-full max-w-md mx-auto perspective-1000">
      <div
        className={`relative w-full h-96 cursor-pointer transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''
          }`}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`${item.english_word}. ${isFlipped ? 'Flipped' : 'Clique para ouvir a pronúncia'}`}
        aria-pressed={isFlipped}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className="absolute inset-0 bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="w-full h-48 mb-6 rounded-xl bg-gray-50 shadow-lg flex items-center justify-center p-4">
            <img
              src={item.image_url}
              alt={item.english_word}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-2">{item.english_word}</h2>
          <p className="text-gray-500 text-lg">Clique para ouvir</p>
        </div>

        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center backface-hidden rotate-y-180"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="text-center mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
              <Volume2 className="w-16 h-16 text-white mx-auto mb-4" />
              <p className="text-white text-2xl font-bold mb-2">{item.english_word}</p>
              <p className="text-white text-3xl font-bold">{item.portuguese_word}</p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleComplete();
            }}
            className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2"
          >
            <Check className="w-6 h-6" />
            Próximo
          </button>
        </div>
      </div>

      {showCheck && (
        <div className="absolute inset-0 flex items-center justify-center bg-green-500/90 rounded-3xl animate-scale-in">
          <Check className="w-32 h-32 text-white animate-bounce" />
        </div>
      )}
    </div>
  );
};
