import { useState, useEffect } from 'react';
import { Trophy, RotateCcw } from 'lucide-react';
import { LearningItem } from '../lib/supabase';
import { speak } from '../utils/speech';

interface MemoryGameProps {
  items: LearningItem[];
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Card {
  id: string;
  content: string;
  type: 'word' | 'image';
  itemId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryGame = ({ items, onComplete, onBack }: MemoryGameProps) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);

  useEffect(() => {
    initializeGame();
  }, [items]);

  const initializeGame = () => {
    const gameCards: Card[] = [];
    items.slice(0, 6).forEach((item) => {
      gameCards.push({
        id: `word-${item.id}`,
        content: item.english_word,
        type: 'word',
        itemId: item.id,
        isFlipped: false,
        isMatched: false,
      });
      gameCards.push({
        id: `image-${item.id}`,
        content: item.image_url,
        type: 'image',
        itemId: item.id,
        isFlipped: false,
        isMatched: false,
      });
    });

    setCards(gameCards.sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
  };

  const handleCardClick = (index: number) => {
    if (flippedCards.length === 2 || cards[index].isFlipped || cards[index].isMatched) {
      return;
    }

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    if (cards[index].type === 'word') {
      speak(cards[index].content);
    }

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      const [firstIndex, secondIndex] = newFlippedCards;

      if (cards[firstIndex].itemId === cards[secondIndex].itemId) {
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstIndex].isMatched = true;
          matchedCards[secondIndex].isMatched = true;
          setCards(matchedCards);
          setFlippedCards([]);
          setMatches(matches + 1);

          if (matches + 1 === 6) {
            setTimeout(() => {
              const score = Math.max(0, 1000 - (moves * 10));
              onComplete(score);
            }, 500);
          }
        }, 1000);
      } else {
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstIndex].isFlipped = false;
          resetCards[secondIndex].isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            ← Voltar
          </button>
          <button
            onClick={initializeGame}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reiniciar
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Jogo da Memória</h2>
          <p className="text-gray-600 text-center mb-6">Encontre os pares de palavras e imagens!</p>

          <div className="flex justify-center gap-8 text-center">
            <div>
              <p className="text-gray-600 text-sm">Jogadas</p>
              <p className="text-3xl font-bold text-purple-600">{moves}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Pares</p>
              <p className="text-3xl font-bold text-green-600">{matches}/6</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          {cards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              disabled={card.isMatched || card.isFlipped}
              className={`aspect-square rounded-2xl transition-all duration-300 transform ${
                card.isMatched
                  ? 'bg-green-400 scale-95 opacity-50'
                  : card.isFlipped
                  ? 'bg-white shadow-xl scale-105'
                  : 'bg-gradient-to-br from-blue-400 to-purple-500 hover:scale-105 shadow-lg'
              }`}
            >
              {card.isFlipped || card.isMatched ? (
                <div className="w-full h-full flex items-center justify-center p-3">
                  {card.type === 'image' ? (
                    <img
                      src={card.content}
                      alt="memory card"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <span className="text-xl font-bold text-gray-800">{card.content}</span>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl">❓</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
