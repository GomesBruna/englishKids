import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { LearningItem } from '../lib/supabase';
import { speak } from '../utils/speech';
import { useActivityLogger } from '../hooks/useActivityLogger';

interface QuizGameProps {
  items: LearningItem[];
  onComplete: (score: number) => void;
  onBack: () => void;
}

export const QuizGame = ({ items, onComplete, onBack }: QuizGameProps) => {
  const { logActivity } = useActivityLogger();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<LearningItem[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    generateOptions();
    if (currentIndex === 0) {
      logActivity('game_start', 'Quiz Game');
    }
  }, [currentIndex]);

  const generateOptions = () => {
    const currentItem = items[currentIndex];
    const otherItems = items.filter((item) => item.id !== currentItem.id);
    const shuffled = otherItems.sort(() => Math.random() - 0.5).slice(0, 3);
    const allOptions = [...shuffled, currentItem].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
    setSelectedOption(null);
    setIsCorrect(null);
  };

  const handleOptionClick = (option: LearningItem) => {
    if (selectedOption) return;

    const currentItem = items[currentIndex];
    setSelectedOption(option.id);
    const correct = option.id === currentItem.id;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 100);
      speak(option.audio_text);
    }

    setTimeout(() => {
      if (currentIndex < items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onComplete(score + (correct ? 100 : 0));
      }
    }, 1500);
  };

  const handlePlayAudio = () => {
    speak(items[currentIndex].audio_text);
  };

  const currentItem = items[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            ← Voltar
          </button>
          <div className="bg-white px-6 py-3 rounded-full shadow-md">
            <span className="text-gray-600 font-medium">Pontos: </span>
            <span className="text-2xl font-bold text-orange-600">{score}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Escolha a Resposta Certa</h2>
          <p className="text-gray-600 mb-4">
            {currentIndex + 1} de {items.length}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-orange-400 to-red-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <button
            onClick={handlePlayAudio}
            className="w-full mb-6 p-4 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-2xl font-bold text-xl hover:shadow-lg transition-all"
          >
            🔊 Ouça a palavra
          </button>

          <div className="text-center mb-6">
            <p className="text-gray-600 text-lg mb-2">Qual imagem corresponde?</p>
            <p className="text-4xl font-bold text-gray-800">{currentItem.english_word}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {options.map((option) => {
            const isSelected = selectedOption === option.id;
            const isCurrentCorrect = option.id === currentItem.id;
            const showResult = selectedOption !== null;

            return (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option)}
                disabled={selectedOption !== null}
                className={`relative p-4 rounded-2xl transition-all duration-300 transform ${showResult
                    ? isSelected && isCorrect
                      ? 'bg-green-400 scale-105 shadow-xl'
                      : isSelected && !isCorrect
                        ? 'bg-red-400 scale-95'
                        : isCurrentCorrect
                          ? 'bg-green-400 shadow-xl'
                          : 'bg-white'
                    : 'bg-white hover:scale-105 hover:shadow-xl'
                  } shadow-lg`}
              >
                <div className="aspect-square rounded-xl overflow-hidden mb-3">
                  <img
                    src={option.image_url}
                    alt={option.english_word}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="font-bold text-gray-800">{option.portuguese_word}</p>

                {showResult && isSelected && (
                  <div className="absolute top-2 right-2">
                    {isCorrect ? (
                      <Check className="w-8 h-8 text-white bg-green-600 rounded-full p-1" />
                    ) : (
                      <X className="w-8 h-8 text-white bg-red-600 rounded-full p-1" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
