import { useState, useRef } from 'react';
import { Users, School, BookOpen, PenTool, Play, Pause, ChevronRight, Loader2, Volume2, PlayCircle, Video } from 'lucide-react';
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
    const [mode, setMode] = useState<'class' | 'practice' | 'video' | null>(null);
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

    const handleBackFromAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        setPlayingAudioId(null);
        setSelectedLesson(null);
        setMode(null);
    };

    const currentLessonIndex = selectedCategory?.lessons.findIndex(l => l.id === selectedLesson?.id) ?? -1;
    const hasNextLesson = selectedCategory && currentLessonIndex < selectedCategory.lessons.length - 1;
    const hasPrevLesson = currentLessonIndex > 0;

    const handleNextLesson = () => {
        if (hasNextLesson && selectedCategory) {
            if (audioRef.current) audioRef.current.pause();
            setPlayingAudioId(null);
            setSelectedLesson(selectedCategory.lessons[currentLessonIndex + 1]);
        }
    };

    const handlePrevLesson = () => {
        if (hasPrevLesson && selectedCategory) {
            if (audioRef.current) audioRef.current.pause();
            setPlayingAudioId(null);
            setSelectedLesson(selectedCategory.lessons[currentLessonIndex - 1]);
        }
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

    // Show category videos
    if (selectedCategory && mode === 'video') {
        const videos = selectedCategory.videos;

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={() => setMode(null)}
                            className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        >
                            ← Voltar
                        </button>
                        <div className={`${selectedCategory.color} text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg`}>
                            {selectedCategory.name} - Vídeos
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                            Assista aos vídeos:
                        </h2>

                        {videos.length === 0 ? (
                            <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
                                <PlayCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                                <p className="text-xl text-gray-500 font-medium">Nenhum vídeo disponível ainda.</p>
                                <p className="text-gray-400 mt-2">Estamos preparando novidades para você!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-12">
                                {videos.map((video) => (
                                    <div key={video.id} className="bg-white rounded-3xl shadow-xl overflow-hidden">
                                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                                <PlayCircle className="w-6 h-6 text-purple-500" />
                                                {video.title || 'Vídeo de Aula'}
                                            </h3>
                                        </div>
                                        <div className="aspect-video bg-black">
                                            <iframe
                                                src={`${video.video_url.includes('embed') ? video.video_url : video.video_url.replace('watch?v=', 'embed/')}`}
                                                title={video.title || 'YouTube video player'}
                                                className="w-full h-full"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Show lesson with image and all audios listed below
    if (selectedLesson && mode && selectedCategory) {
        const audios = mode === 'class' ? selectedLesson.classAudios : selectedLesson.practiceAudios;

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
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
                            {/* Image */}
                            <div className="aspect-video bg-gray-100 relative">
                                {selectedLesson.image_url ? (
                                    <img
                                        src={selectedLesson.image_url}
                                        alt={selectedLesson.title || 'Imagem da lição'}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x450?text=Imagem+em+breve';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                                        <Volume2 className="w-24 h-24 text-blue-300" />
                                    </div>
                                )}

                                {/* Lesson Indicator */}
                                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                                    Lição {currentLessonIndex + 1} de {selectedCategory.lessons.length}
                                </div>

                                {/* Audio count indicator */}
                                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                                    {audios.length} áudio{audios.length !== 1 ? 's' : ''}
                                </div>
                            </div>

                            {/* Audio List */}
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">
                                    {mode === 'class' ? '📚 Áudios da Aula' : '✏️ Áudios da Prática'}
                                </h3>

                                {audios.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">Nenhum áudio disponível ainda.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {audios.map((audio, index) => (
                                            <div
                                                key={audio.id}
                                                className={`flex items-center gap-4 rounded-2xl p-4 transition-all ${playingAudioId === audio.id
                                                    ? 'bg-blue-50 border-2 border-blue-200'
                                                    : 'bg-gray-50 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <button
                                                    onClick={() => handlePlayAudio(audio)}
                                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${playingAudioId === audio.id
                                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                                        : 'bg-gradient-to-r from-blue-500 to-purple-600'
                                                        } text-white hover:shadow-lg hover:scale-105`}
                                                >
                                                    {playingAudioId === audio.id ? (
                                                        <Pause className="w-5 h-5" />
                                                    ) : (
                                                        <Play className="w-5 h-5 ml-0.5" />
                                                    )}
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-800 truncate">
                                                        {audio.title || `Áudio ${index + 1}`}
                                                    </p>
                                                    {playingAudioId === audio.id && (
                                                        <p className="text-sm text-green-600 flex items-center gap-1">
                                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                            Reproduzindo...
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={handlePrevLesson}
                                disabled={!hasPrevLesson}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all ${hasPrevLesson
                                    ? 'bg-white text-gray-700 shadow-md hover:shadow-xl hover:-translate-y-1'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                                    }`}
                            >
                                Anterior
                            </button>
                            <button
                                onClick={handleNextLesson}
                                disabled={!hasNextLesson}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all ${hasNextLesson
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-2xl hover:-translate-y-1'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                                    }`}
                            >
                                Próxima
                            </button>
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
                            {selectedCategory.name} {mode === 'video' ? '- Vídeos' : ''}
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                            Escolha como deseja estudar:
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <button
                                onClick={() => {
                                    if (selectedCategory.lessons.length > 0) {
                                        setSelectedLesson(selectedCategory.lessons[0]);
                                        setMode('class');
                                    }
                                }}
                                className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-8 text-center border-b-8 border-blue-500 active:border-b-0 active:translate-y-2"
                            >
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:rotate-6 transition-transform">
                                    <BookOpen className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Aula</h3>
                                <p className="text-sm text-gray-600">Aprenda novos conteúdos</p>
                            </button>

                            <button
                                onClick={() => {
                                    if (selectedCategory.lessons.length > 0) {
                                        setSelectedLesson(selectedCategory.lessons[0]);
                                        setMode('practice');
                                    }
                                }}
                                className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-8 text-center border-b-8 border-emerald-500 active:border-b-0 active:translate-y-2"
                            >
                                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:-rotate-6 transition-transform">
                                    <PenTool className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Prática</h3>
                                <p className="text-sm text-gray-600">Exercite o que aprendeu</p>
                            </button>

                            <button
                                onClick={() => {
                                    setMode('video');
                                }}
                                className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-8 text-center border-b-8 border-purple-500 active:border-b-0 active:translate-y-2"
                            >
                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                                    <Video className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Vídeos</h3>
                                <p className="text-sm text-gray-600">Assista e aprenda</p>
                            </button>
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
