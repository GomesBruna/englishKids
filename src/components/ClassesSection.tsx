import { useState, useRef } from 'react';
import { Users, School, BookOpen, PenTool, Play, Pause, ChevronRight, ChevronLeft, Loader2, Volume2 } from 'lucide-react';
import { useClassCategories } from '../hooks/useClassCategories';
import { ClassCategoryWithLessons, LessonWithAudios, LessonAudio } from '../lib/supabase';

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    users: Users,
    school: School,
};

interface ClassesSectionProps {
    onBack: () => void;
}

export function ClassesSection({ onBack }: ClassesSectionProps) {
    const { categories, loading, error } = useClassCategories();
    const [selectedCategory, setSelectedCategory] = useState<ClassCategoryWithLessons | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<LessonWithAudios | null>(null);
    const [mode, setMode] = useState<'class' | 'practice' | null>(null);
    const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handlePlayAudio = (audio: LessonAudio) => {
        // If same audio is playing, pause it
        if (isPlaying && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
            return;
        }

        // Stop current audio if any
        if (audioRef.current) {
            audioRef.current.pause();
        }

        // Play new audio
        const newAudio = new Audio(audio.audio_url);
        audioRef.current = newAudio;
        setIsPlaying(true);

        newAudio.play().catch((err) => {
            console.error('Error playing audio:', err);
            setIsPlaying(false);
        });

        newAudio.onended = () => {
            setIsPlaying(false);
        };
    };

    const handlePrevious = () => {
        if (currentAudioIndex > 0) {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            setIsPlaying(false);
            setCurrentAudioIndex(currentAudioIndex - 1);
        }
    };

    const handleNext = (audiosLength: number) => {
        if (currentAudioIndex < audiosLength - 1) {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            setIsPlaying(false);
            setCurrentAudioIndex(currentAudioIndex + 1);
        }
    };

    const handleBackFromAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        setIsPlaying(false);
        setCurrentAudioIndex(0);
        setSelectedLesson(null);
        setMode(null);
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-xl text-gray-600">Carregando aulas...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
                    <p className="text-xl text-red-600 mb-4">Erro ao carregar aulas</p>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={onBack}
                        className="bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
                    >
                        Voltar
                    </button>
                </div>
            </div>
        );
    }

    // Show audio player with image for a lesson
    if (selectedLesson && mode && selectedCategory) {
        const audios = mode === 'class' ? selectedLesson.classAudios : selectedLesson.practiceAudios;
        const currentAudio = audios[currentAudioIndex];

        if (!currentAudio) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
                    <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
                        <p className="text-xl text-gray-600 mb-4">Nenhum áudio disponível</p>
                        <button
                            onClick={handleBackFromAudio}
                            className="bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
                        >
                            Voltar
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={handleBackFromAudio}
                            className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        >
                            ← Voltar
                        </button>
                        <div className={`${selectedCategory.color} text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg`}>
                            {selectedLesson.title} - {mode === 'class' ? 'Aula' : 'Prática'}
                        </div>
                    </div>

                    {/* Main Content Card */}
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                            {/* Image */}
                            <div className="aspect-video bg-gray-100 relative">
                                {currentAudio.image_url ? (
                                    <img
                                        src={currentAudio.image_url}
                                        alt={currentAudio.title || 'Imagem da lição'}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            // Fallback for missing images
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x450?text=Imagem+em+breve';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                                        <Volume2 className="w-24 h-24 text-blue-300" />
                                    </div>
                                )}

                                {/* Audio indicator */}
                                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                    {currentAudioIndex + 1} / {audios.length}
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="p-6">
                                {/* Title */}
                                <h3 className="text-xl font-bold text-gray-800 text-center mb-6">
                                    {currentAudio.title || `Áudio ${currentAudioIndex + 1}`}
                                </h3>

                                {/* Audio Controls */}
                                <div className="flex items-center justify-center gap-4 mb-6">
                                    {/* Previous Button */}
                                    <button
                                        onClick={handlePrevious}
                                        disabled={currentAudioIndex === 0}
                                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${currentAudioIndex === 0
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                                            }`}
                                    >
                                        <ChevronLeft className="w-8 h-8" />
                                    </button>

                                    {/* Play/Pause Button */}
                                    <button
                                        onClick={() => handlePlayAudio(currentAudio)}
                                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all transform hover:scale-105 shadow-lg ${isPlaying
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                                : 'bg-gradient-to-r from-blue-500 to-purple-600'
                                            } text-white`}
                                    >
                                        {isPlaying ? (
                                            <Pause className="w-10 h-10" />
                                        ) : (
                                            <Play className="w-10 h-10 ml-1" />
                                        )}
                                    </button>

                                    {/* Next Button */}
                                    <button
                                        onClick={() => handleNext(audios.length)}
                                        disabled={currentAudioIndex === audios.length - 1}
                                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${currentAudioIndex === audios.length - 1
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                                            }`}
                                    >
                                        <ChevronRight className="w-8 h-8" />
                                    </button>
                                </div>

                                {/* Progress Dots */}
                                {audios.length > 1 && (
                                    <div className="flex justify-center gap-2">
                                        {audios.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    if (audioRef.current) {
                                                        audioRef.current.pause();
                                                    }
                                                    setIsPlaying(false);
                                                    setCurrentAudioIndex(index);
                                                }}
                                                className={`w-3 h-3 rounded-full transition-all ${index === currentAudioIndex
                                                        ? 'bg-blue-500 scale-125'
                                                        : 'bg-gray-300 hover:bg-gray-400'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Helper text */}
                        <p className="text-center text-gray-500 mt-4 text-sm">
                            Use os botões ← → para navegar entre os áudios
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Show lesson list with Class/Practice options
    if (selectedCategory) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                <div className="container mx-auto px-4 py-12">
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        >
                            ← Voltar
                        </button>
                        <div className={`${selectedCategory.color} text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg`}>
                            {selectedCategory.name}
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                            Escolha uma lição:
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedCategory.lessons.map((lesson) => (
                                <div
                                    key={lesson.id}
                                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
                                >
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">{lesson.title}</h3>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setSelectedLesson(lesson);
                                                setMode('class');
                                                setCurrentAudioIndex(0);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105"
                                        >
                                            <BookOpen className="w-5 h-5" />
                                            Aula
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedLesson(lesson);
                                                setMode('practice');
                                                setCurrentAudioIndex(0);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105"
                                        >
                                            <PenTool className="w-5 h-5" />
                                            Prática
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show category selection (My Friends / At School)
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <div className="container mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={onBack}
                        className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                    >
                        ← Voltar
                    </button>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                        Aulas
                    </div>
                </div>

                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                        Escolha uma categoria:
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {categories.map((category) => {
                            const IconComponent = iconMap[category.icon] || Users;
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category)}
                                    className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-8 text-left"
                                >
                                    <div
                                        className={`${category.color} w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                                    >
                                        <IconComponent className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                                        {category.name}
                                        <ChevronRight className="w-6 h-6 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                    </h3>
                                    <p className="text-gray-600">{category.lessons.length} lições disponíveis</p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
