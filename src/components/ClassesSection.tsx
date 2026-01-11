import { useState, useRef } from 'react';
import { Users, School, BookOpen, PenTool, Play, Pause, ChevronRight, Loader2 } from 'lucide-react';
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
    const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handlePlayAudio = (audio: LessonAudio) => {
        // If same audio is playing, pause it
        if (playingAudioId === audio.id && audioRef.current) {
            audioRef.current.pause();
            setPlayingAudioId(null);
            return;
        }

        // Stop current audio if any
        if (audioRef.current) {
            audioRef.current.pause();
        }

        // Play new audio
        const newAudio = new Audio(audio.audio_url);
        audioRef.current = newAudio;
        setPlayingAudioId(audio.id);

        newAudio.play().catch((err) => {
            console.error('Error playing audio:', err);
            setPlayingAudioId(null);
        });

        newAudio.onended = () => {
            setPlayingAudioId(null);
        };
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

    // Show audio player for a lesson
    if (selectedLesson && mode && selectedCategory) {
        const audios = mode === 'class' ? selectedLesson.classAudios : selectedLesson.practiceAudios;

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                <div className="container mx-auto px-4 py-12">
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={() => {
                                setSelectedLesson(null);
                                setMode(null);
                                if (audioRef.current) {
                                    audioRef.current.pause();
                                }
                                setPlayingAudioId(null);
                            }}
                            className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        >
                            ← Voltar
                        </button>
                        <div className={`${selectedCategory.color} text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg`}>
                            {selectedLesson.title} - {mode === 'class' ? 'Aula' : 'Prática'}
                        </div>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                                {mode === 'class' ? '📚 Áudios da Aula' : '✏️ Áudios da Prática'}
                            </h2>

                            {audios.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Nenhum áudio disponível ainda.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {audios.map((audio, index) => (
                                        <div
                                            key={audio.id}
                                            className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors"
                                        >
                                            <button
                                                className={`${playingAudioId === audio.id
                                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                                        : 'bg-gradient-to-r from-blue-500 to-purple-600'
                                                    } text-white w-12 h-12 rounded-full flex items-center justify-center hover:shadow-lg transition-all`}
                                                onClick={() => handlePlayAudio(audio)}
                                            >
                                                {playingAudioId === audio.id ? (
                                                    <Pause className="w-5 h-5" />
                                                ) : (
                                                    <Play className="w-5 h-5 ml-1" />
                                                )}
                                            </button>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">
                                                    {audio.title || `Áudio ${index + 1}`}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {audio.audio_url.includes('placeholder') || audio.audio_url.startsWith('/audios/')
                                                        ? '(Áudio será adicionado)'
                                                        : 'Clique para ouvir'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
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
