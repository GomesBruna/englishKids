import { BookOpen, Languages } from 'lucide-react';

interface MainSectionSelectorProps {
    onSelectClasses: () => void;
    onSelectVocabulary: () => void;
}

export function MainSectionSelector({ onSelectClasses, onSelectVocabulary }: MainSectionSelectorProps) {
    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                Escolha como você quer aprender:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Aulas Button */}
                <button
                    onClick={onSelectClasses}
                    className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-8 text-left"
                >
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Aulas</h3>
                    <p className="text-gray-600">Aprenda com as aulas do livro de inglês</p>
                </button>

                {/* Vocabulário Button */}
                <button
                    onClick={onSelectVocabulary}
                    className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-8 text-left"
                >
                    <div className="bg-gradient-to-br from-green-400 to-emerald-500 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Languages className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Vocabulário</h3>
                    <p className="text-gray-600">Aprenda palavras novas jogando</p>
                </button>
            </div>
        </div>
    );
}
