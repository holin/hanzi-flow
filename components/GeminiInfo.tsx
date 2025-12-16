import React from 'react';
import { CharacterDetails } from '../types';
import { BookOpen, Sparkles, History, Layers, Volume2 } from 'lucide-react';

interface GeminiInfoProps {
    data: CharacterDetails | null;
    isLoading: boolean;
    error: string | null;
}

const GeminiInfo: React.FC<GeminiInfoProps> = ({ data, isLoading, error }) => {
    
    const playAudio = (text: string) => {
        if (!('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel(); // Stop any currently playing audio
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8; 
        
        // Find best voice
        const voices = window.speechSynthesis.getVoices();
        const zhVoice = voices.find(v => v.lang === 'zh-CN') || 
                        voices.find(v => v.lang.startsWith('zh'));
                        
        if (zhVoice) {
            utterance.voice = zhVoice;
            utterance.lang = zhVoice.lang;
        } else {
            utterance.lang = 'zh-CN';
        }

        window.speechSynthesis.speak(utterance);
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-12 text-stone-400 animate-pulse">
                <Sparkles className="w-8 h-8 mb-4 text-stone-300" />
                <p>正在询问 AI 老师...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full p-6 bg-red-50 rounded-xl border border-red-100 text-red-600">
                <p className="font-medium">AI 服务暂时不可用</p>
                <p className="text-sm mt-1 opacity-80">{error}</p>
                <p className="text-xs mt-4 text-red-400">请检查网络或 API Key 设置。</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="w-full bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            {/* Header / Pinyin */}
            <div className="bg-stone-50 p-6 border-b border-stone-100 flex items-center gap-4 flex-wrap">
                <h2 className="text-4xl font-serif text-ink-900">{data.character}</h2>
                
                <div className="flex items-center gap-3">
                    <span className="text-2xl font-serif text-rose-600 font-medium">{data.pinyin}</span>
                    <button 
                        onClick={() => playAudio(data.character)}
                        className="p-2 text-rose-500 bg-rose-100 hover:bg-rose-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300 active:bg-rose-300"
                        title="朗读"
                        aria-label="朗读汉字"
                    >
                        <Volume2 size={20} />
                    </button>
                </div>

                <span className="ml-auto text-xs font-bold text-stone-400 uppercase tracking-wider border border-stone-200 px-2 py-1 rounded">
                    AI 解析
                </span>
            </div>

            <div className="p-6 space-y-6">
                {/* Definition */}
                <div className="flex gap-4">
                    <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        <BookOpen size={16} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wide mb-1">释义</h3>
                        <p className="text-lg text-stone-800 leading-relaxed font-medium">
                            {data.definition}
                        </p>
                    </div>
                </div>

                {/* Etymology */}
                <div className="flex gap-4">
                     <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <History size={16} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wide mb-1">字源 / 助记</h3>
                        <p className="text-stone-600 leading-relaxed italic border-l-2 border-indigo-100 pl-3">
                            "{data.etymology}"
                        </p>
                    </div>
                </div>

                {/* Examples */}
                <div className="flex gap-4">
                     <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Layers size={16} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wide mb-3">常用词组</h3>
                        <div className="grid gap-3">
                            {data.examples.map((ex, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-serif font-bold text-ink-800">{ex.word}</span>
                                        <span className="text-sm text-rose-600 font-medium">{ex.pinyin}</span>
                                        <button 
                                            onClick={() => playAudio(ex.word)}
                                            className="p-1.5 text-stone-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors focus:outline-none active:bg-emerald-100"
                                            title="朗读词组"
                                        >
                                            <Volume2 size={16} />
                                        </button>
                                    </div>
                                    <span className="text-sm text-stone-500">{ex.meaning}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeminiInfo;