import { useEffect, useState } from 'react';
import { Palette, Hash, Rabbit, Users, Trophy, BookOpen, Brain, Mic, Target, Sparkles, LogOut, PlayCircle, Apple } from 'lucide-react';
import { CategoryButton } from './components/CategoryButton';
import { LearningCard } from './components/LearningCard';
import { ProgressBar } from './components/ProgressBar';
import { GameModeButton } from './components/GameModeButton';
import { MemoryGame } from './components/MemoryGame';
import { PronunciationGame } from './components/PronunciationGame';
import { QuizGame } from './components/QuizGame';
import { LoginPage } from './components/LoginPage';
import { useLearningItems } from './hooks/useLearningItems';
import { useAuth } from './contexts/AuthContext';

//type Category = 'colors' | 'numbers' | 'animals' | 'pronouns';
type Category = 'colors' | 'numbers' | 'animals' | ' fruits';
type GameMode = 'learn' | 'memory' | 'pronunciation' | 'quiz' | 'video' | null;

const categories = [
  { id: 'colors' as Category, icon: Palette, label: 'Cores', color: 'bg-gradient-to-br from-red-400 to-pink-500', videoUrl: 'https://www.youtube.com/embed/SLZcWGQQsmg?si=dBv_FX9NTgEQlHLX' },
  { id: 'numbers' as Category, icon: Hash, label: 'Números', color: 'bg-gradient-to-br from-blue-400 to-cyan-500', videoUrl: 'https://www.youtube.com/embed/o0IsBUaoTrQ?si=-_mWrNnpK_kBrPov'  },
  { id: 'animals' as Category, icon: Rabbit, label: 'Animais', color: 'bg-gradient-to-br from-green-400 to-emerald-500', videoUrl: 'https://www.youtube.com/embed/4jeHK_9NiXI?si=PV_jHNHRJ_lIkQrA' },
  { id: 'fruits' as Category, icon: Apple, label: 'Fruits', color: 'bg-gradient-to-br from-green-400 to-green-500', videoUrl: 'https://www.youtube.com/embed/mfReSbQ7jzE?si=iJAYpjNmff-VLOLG' }
  //{ id: 'pronouns' as Category, icon: Users, label: 'Pronomes', color: 'bg-gradient-to-br from-orange-400 to-amber-500' },
];

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);

  const { items, loading } = useLearningItems(selectedCategory || 'colors');

  useEffect(() => {
    let isMounted = true;
    setAssetsReady(false);

    const preload = async () => {
      if (!items.length) {
        setAssetsReady(true);
        return;
      }

      await Promise.all(
        items.map(
          (item) =>
            new Promise<void>((resolve) => {
              const img = new Image();
              img.onload = () => resolve();
              img.onerror = () => resolve();
              img.src = item.image_url;
            })
        )
      );

      if (isMounted) {
        setAssetsReady(true);
      }
    };

    preload();

    return () => {
      isMounted = false;
    };
  }, [items]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleNext = () => {
    setScore(score + 10);
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowCompletion(true);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setShowCompletion(false);
    setSelectedCategory(null);
    setGameMode(null);
  };

  const handleBackToModes = () => {
    setGameMode(null);
    setCurrentIndex(0);
    setScore(0);
    setShowCompletion(false);
  };

  const handleGameComplete = (finalScore: number) => {
    setScore(finalScore);
    setShowCompletion(true);
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setGameMode(null);
    setCurrentIndex(0);
    setScore(0);
    setShowCompletion(false);
  };

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all text-gray-700 font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="w-16 h-16 text-blue-600" />
              <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                English Kids
              </h1>
            </div>
            <p className="text-2xl text-gray-600 font-medium">
              Aprenda Inglês brincando! 🇧🇷 → 🇺🇸
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Escolha uma categoria:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((category) => (
                <CategoryButton
                  key={category.id}
                  icon={category.icon}
                  label={category.label}
                  color={category.color}
                  onClick={() => handleCategorySelect(category.id)}
                  isActive={false}
                />
              ))}
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="inline-block bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Como jogar:</h3>
              <ul className="text-left space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">👆</span>
                  <span>Escolha uma categoria</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🎮</span>
                  <span>Selecione um modo de jogo</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🔊</span>
                  <span>Ouça e pratique a pronúncia</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">⭐</span>
                  <span>Ganhe pontos e aprenda se divertindo!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !assetsReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Carregando imagens...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (selectedCategory && !gameMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleReset}
              className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              ← Voltar
            </button>
            <div className={`${categories.find(c => c.id === selectedCategory)?.color} text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg`}>
              {categories.find(c => c.id === selectedCategory)?.label}
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-800 mb-4 text-center">Escolha um modo de jogo:</h2>
            <p className="text-gray-600 text-center mb-12 text-lg">Cada jogo vai te ajudar a aprender de um jeito diferente!</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GameModeButton
                icon={Sparkles}
                title="Aprender"
                description="Veja cartões com imagens e ouça a pronúncia"
                color="bg-gradient-to-br from-blue-400 to-cyan-500"
                onClick={() => setGameMode('learn')}
              />
              <GameModeButton
                icon={Brain}
                title="Jogo da Memória"
                description="Encontre pares de palavras e imagens"
                color="bg-gradient-to-br from-purple-400 to-pink-500"
                onClick={() => setGameMode('memory')}
              />
              <GameModeButton
                icon={PlayCircle}
                title="Vídeos"
                description="Assista um vídeo desta categoria"
                color="bg-gradient-to-br from-emerald-400 to-lime-500"
                onClick={() => setGameMode('video')}
              />
              {/* <GameModeButton
                icon={Mic}
                title="Pratique Falar"
                description="Fale as palavras e receba feedback"
                color="bg-gradient-to-br from-green-400 to-emerald-500"
                onClick={() => setGameMode('pronunciation')}
              /> */}
              <GameModeButton
                icon={Target}
                title="Quiz"
                description="Escolha a resposta certa para cada palavra"
                color="bg-gradient-to-br from-orange-400 to-red-500"
                onClick={() => setGameMode('quiz')}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showCompletion) {
    const gameModeNames = {
      learn: 'Aprender',
      memory: 'Jogo da Memória',
      pronunciation: 'Pratique Falar',
      quiz: 'Quiz'
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-32 h-32 text-yellow-500 mx-auto mb-6 animate-bounce" />
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Parabéns! 🎉</h1>
          <p className="text-2xl text-gray-600 mb-8">
            Você completou {gameModeNames[gameMode as keyof typeof gameModeNames]} - {categories.find(c => c.id === selectedCategory)?.label}!
          </p>
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 inline-block">
            <p className="text-gray-600 text-lg mb-2">Sua pontuação:</p>
            <p className="text-6xl font-bold text-yellow-500">{score}</p>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleBackToModes}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Jogar Outro Modo
            </button>
            <button
              onClick={handleReset}
              className="bg-white text-gray-700 border-2 border-gray-300 px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Escolher Categoria
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'video' && selectedCategory) {
    const categoryInfo = categories.find(c => c.id === selectedCategory);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleBackToModes}
              className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              ← Voltar
            </button>
            <div className={`${categoryInfo?.color} text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg`}>
              {categoryInfo?.label}
            </div>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <PlayCircle className="w-8 h-8 text-purple-500" />
              Vídeo da categoria
            </h2>
            <p className="text-gray-600 mb-6">
              Assista ao vídeo e repita as palavras em voz alta para praticar a pronúncia.
            </p>
            {categoryInfo?.videoUrl ? (
              <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-lg">
                <iframe
                  src={`${categoryInfo.videoUrl}?rel=0`}
                  title={`Vídeo de ${categoryInfo.label}`}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="text-center text-gray-500 py-16">
                Nenhum vídeo disponível para esta categoria ainda.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'memory') {
    return <MemoryGame items={items} onComplete={handleGameComplete} onBack={handleBackToModes} />;
  }

  if (gameMode === 'pronunciation') {
    return <PronunciationGame items={items} onComplete={handleGameComplete} onBack={handleBackToModes} />;
  }

  if (gameMode === 'quiz') {
    return <QuizGame items={items} onComplete={handleGameComplete} onBack={handleBackToModes} />;
  }

  const currentItem = items[currentIndex];
  const categoryInfo = categories.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleBackToModes}
              className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              ← Voltar
            </button>
            <div className={`${categoryInfo?.color} text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg`}>
              {categoryInfo?.label}
            </div>
          </div>

          <ProgressBar current={currentIndex + 1} total={items.length} score={score} />

          {currentItem && <LearningCard item={currentItem} onComplete={handleNext} />}

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Clique no cartão para virar e ouvir a pronúncia
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
