import { useState, useEffect } from 'react';
import { Mic, Volume2, Check, X } from 'lucide-react';
import { LearningItem } from '../lib/supabase';
import { speak } from '../utils/speech';

interface PronunciationGameProps {
  items: LearningItem[];
  onComplete: (score: number) => void;
  onBack: () => void;
}

export const PronunciationGame = ({ items, onComplete, onBack }: PronunciationGameProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState(0);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.lang = 'en-US';
      recognitionInstance.interimResults = false;
      recognitionInstance.maxAlternatives = 5;

      recognitionInstance.onresult = (event: any) => {
        const results = Array.from(event.results[0]);
        const spokenWords = results.map((result: any) => result.transcript.toLowerCase());
        const targetWord = items[currentIndex].english_word.toLowerCase();

        const isCorrect = spokenWords.some((word: string) =>
          word === targetWord || word.includes(targetWord)
        );

        if (isCorrect) {
          setFeedback('correct');
          setScore(score + 100);
          setTimeout(() => {
            if (currentIndex < items.length - 1) {
              setCurrentIndex(currentIndex + 1);
              setFeedback(null);
            } else {
              onComplete(score + 100);
            }
          }, 1500);
        } else {
          setFeedback('incorrect');
          setTimeout(() => setFeedback(null), 1500);
        }
        setIsListening(false);
      };

      recognitionInstance.onerror = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [currentIndex, score, items, onComplete]);

  const handleListen = () => {
    speak(items[currentIndex].audio_text);
  };

  const handleStartRecording = () => {
    if (recognition) {
      setIsListening(true);
      setFeedback(null);
      recognition.start();
    }
  };

  const currentItem = items[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 p-8">
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
            <span className="text-2xl font-bold text-green-600">{score}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Pratique a Pronúncia</h2>
          <p className="text-gray-600 mb-4">
            {currentIndex + 1} de {items.length}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
            <div
              className="bg-gradient-to-r from-green-400 to-teal-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-64 h-64 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={currentItem.image_url}
              alt={currentItem.english_word}
              className="w-full h-full object-cover"
            />
          </div>

          <h3 className="text-5xl font-bold text-gray-800 mb-4">{currentItem.english_word}</h3>
          <p className="text-xl text-gray-500 mb-2">/{currentItem.pronunciation}/</p>
          <p className="text-2xl text-gray-600 mb-8">{currentItem.portuguese_word}</p>

          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={handleListen}
              className="flex items-center gap-2 bg-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-600 transition-colors shadow-lg"
            >
              <Volume2 className="w-6 h-6" />
              Ouvir
            </button>

            {recognition ? (
              <button
                onClick={handleStartRecording}
                disabled={isListening}
                className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                <Mic className="w-6 h-6" />
                {isListening ? 'Ouvindo...' : 'Falar'}
              </button>
            ) : (
              <div className="text-gray-500 text-sm italic px-4 py-2">
                Reconhecimento de voz não disponível neste navegador
              </div>
            )}
          </div>

          {feedback === 'correct' && (
            <div className="bg-green-100 border-2 border-green-500 rounded-2xl p-6 animate-scale-in">
              <Check className="w-16 h-16 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-700">Perfeito!</p>
            </div>
          )}

          {feedback === 'incorrect' && (
            <div className="bg-red-100 border-2 border-red-500 rounded-2xl p-6 animate-scale-in">
              <X className="w-16 h-16 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-700">Tente novamente!</p>
            </div>
          )}

          {!recognition && (
            <button
              onClick={() => {
                setScore(score + 50);
                if (currentIndex < items.length - 1) {
                  setCurrentIndex(currentIndex + 1);
                } else {
                  onComplete(score + 50);
                }
              }}
              className="mt-4 bg-gray-500 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-600 transition-colors"
            >
              Próximo →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
