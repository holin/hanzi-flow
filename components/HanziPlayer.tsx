import React, { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';
import { Play, RotateCcw, PenTool, AlertCircle, Volume2, Heart } from 'lucide-react';
import { HanziWriterInstance } from '../types';
import { getStrokeData } from '../services/strokeService';

declare global {
    interface Window {
        AndroidTTS?: {
            speak: (text: string) => void;
        };
    }
}

interface HanziPlayerProps {
    char: string;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
}

const sharedCharDataLoader = (char: string, onComplete: (data: any) => void, onErr: (msg: any) => void) => {
    getStrokeData(char)
        .then(onComplete)
        .catch(onErr);
};

const HanziPlayer: React.FC<HanziPlayerProps> = ({ char, isFavorite, onToggleFavorite }) => {
    const writerRef = useRef<HanziWriterInstance | null>(null);
    const divRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'view' | 'quiz'>('view');
    const [isLooping, setIsLooping] = useState(false);
    const [quizMessage, setQuizMessage] = useState<string>('');

    // Pre-load voices to ensure they are available on mobile
    useEffect(() => {
        if ('speechSynthesis' in window) {
            const loadVoices = () => {
                window.speechSynthesis.getVoices();
            };
            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.onvoiceschanged = null;
            }
        };
    }, []);

    const playAudio = (times: number = 1) => {
        if ('AndroidTTS' in window) {
            const speak = (remaining: number) => {
                if (remaining <= 0) return;
                window.AndroidTTS.speak(char);
                if (remaining > 1) {
                    setTimeout(() => speak(remaining - 1), 1500 + 600); // Increased gap slightly for better clarity
                }
            };

            speak(times);

            return;
        }

        if (!('speechSynthesis' in window)) return;

        // Cancel any pending speech to ensure fresh start
        window.speechSynthesis.cancel();

        const speak = (remaining: number) => {
            if (remaining <= 0) return;

            const utterance = new SpeechSynthesisUtterance(char);
            utterance.rate = 0.8; // Slightly slower

            // Attempt to find a specific Chinese voice
            const voices = window.speechSynthesis.getVoices();
            const zhVoice = voices.find(v => v.lang === 'zh-CN') ||
                            voices.find(v => v.lang.startsWith('zh'));

            if (zhVoice) {
                utterance.voice = zhVoice;
                utterance.lang = zhVoice.lang;
            } else {
                utterance.lang = 'zh-CN';
            }

            utterance.onend = () => {
                if (remaining > 1) {
                    setTimeout(() => speak(remaining - 1), 600); // Increased gap slightly for better clarity
                }
            };

            utterance.onerror = (e) => {
                console.warn("TTS playback error", e);
            };

            window.speechSynthesis.speak(utterance);
        };

        speak(times);
    };

    useEffect(() => {
        if (!divRef.current) return;

        let isCancelled = false;

        setIsLoading(true);
        setError(null);
        setMode('view');
        setIsLooping(false);
        setQuizMessage('');

        divRef.current.innerHTML = '';

        try {
            const writer = HanziWriter.create(divRef.current, char, {
                width: 300,
                height: 300,
                padding: 20,
                showOutline: true,
                strokeAnimationSpeed: 1,
                delayBetweenStrokes: 200,
                radicalColor: '#e11d48',
                strokeColor: '#1a1a1a',
                outlineColor: '#e5e7eb',
                charDataLoader: sharedCharDataLoader,

                onLoadCharDataSuccess: () => {
                    if (isCancelled) return;
                    setIsLoading(false);
                    writer.animateCharacter();

                    // Restore auto-play twice
                    // Note: Browsers may block this if the user hasn't interacted with the page yet.
                    try {
                        playAudio(2);
                    } catch (e) {
                        console.debug("Auto-play blocked or failed", e);
                    }
                },
                onLoadCharDataError: (err) => {
                    if (isCancelled) return;
                    console.error("HanziWriter load error", err);
                    setIsLoading(false);
                    setError("无法加载汉字数据。可能该字未收录或不是有效的汉字。");
                }
            });

            writerRef.current = (writer as unknown) as HanziWriterInstance;
        } catch (e) {
            console.error("HanziWriter init error", e);
            setError("初始化失败。");
            setIsLoading(false);
        }

        return () => {
            isCancelled = true;
            writerRef.current = null;
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, [char]);

    const handleAnimate = () => {
        if (writerRef.current) {
            setMode('view');
            setIsLooping(false);
            setQuizMessage('');
            writerRef.current.showCharacter();
            writerRef.current.animateCharacter();
        }
    };

    const handleLoop = () => {
        if (writerRef.current) {
            setMode('view');
            setIsLooping(true);
            setQuizMessage('');
            writerRef.current.showCharacter();
            writerRef.current.loopCharacterAnimation();
        }
    };

    const handleQuiz = () => {
        if (writerRef.current) {
            setMode('quiz');
            setIsLooping(false);
            setQuizMessage('请跟随笔画书写！');
            writerRef.current.quiz({
                onComplete: (summary) => {
                    setQuizMessage(`太棒了！错误数: ${summary.totalMistakes}`);
                    setTimeout(() => {
                         if(mode === 'quiz') writerRef.current?.animateCharacter();
                    }, 1000);
                }
            });
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto">
            {/* Display Area */}
            <div className="relative bg-white border-2 border-stone-200 rounded-xl shadow-sm mb-4 overflow-hidden">
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                        <div className="hanzi-loader mb-2"></div>
                        <p className="text-stone-500 font-sans text-sm">加载笔画中...</p>
                    </div>
                )}

                {error ? (
                     <div className="w-[300px] h-[300px] flex flex-col items-center justify-center text-red-500 p-6 text-center">
                        <AlertCircle className="w-12 h-12 mb-2 opacity-50" />
                        <p>{error}</p>
                     </div>
                ) : (
                    <div
                        ref={divRef}
                        className="w-[300px] h-[300px] cursor-crosshair"
                        key={char}
                    />
                )}

                {/* Quiz Feedback Overlay */}
                {mode === 'quiz' && quizMessage && (
                    <div className="absolute top-2 left-0 right-0 text-center pointer-events-none">
                        <span className="bg-stone-800/80 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-md">
                            {quizMessage}
                        </span>
                    </div>
                )}

                {/* Favorite Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite?.();
                    }}
                    className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 backdrop-blur-sm border border-stone-100 shadow-sm text-rose-500 hover:scale-110 transition-all active:scale-95"
                    title={isFavorite ? "取消收藏" : "加入收藏"}
                >
                    <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                </button>
            </div>

            {/* Controls - Grid Layout for side-by-side buttons */}
            <div className="grid grid-cols-4 gap-2 w-[300px] mb-2">
                <button
                    onClick={handleAnimate}
                    disabled={!!error || isLoading}
                    className={`flex items-center justify-center gap-1 sm:gap-2 px-1 py-2.5 rounded-lg transition-colors font-medium text-sm sm:text-base disabled:opacity-50 ${
                        mode === 'view' && !isLooping
                        ? 'bg-stone-200 text-stone-900'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                >
                    <Play size={18} />
                    <span>演示</span>
                </button>
                <button
                    onClick={handleLoop}
                    disabled={!!error || isLoading}
                    className={`flex items-center justify-center gap-1 sm:gap-2 px-1 py-2.5 rounded-lg transition-colors font-medium text-sm sm:text-base disabled:opacity-50 ${
                        isLooping
                        ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-200'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                >
                    <RotateCcw size={18} />
                    <span>循环</span>
                </button>
                <button
                    onClick={handleQuiz}
                    disabled={!!error || isLoading}
                    className={`flex items-center justify-center gap-1 sm:gap-2 px-1 py-2.5 rounded-lg transition-colors font-medium text-sm sm:text-base disabled:opacity-50 ${
                        mode === 'quiz'
                        ? 'bg-stone-800 text-white shadow-md'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                >
                    <PenTool size={18} />
                    <span>测验</span>
                </button>
                <button
                    onClick={() => playAudio(1)}
                    disabled={!!error || isLoading}
                    className="flex items-center justify-center gap-1 sm:gap-2 px-1 py-2.5 rounded-lg transition-colors font-medium text-sm sm:text-base bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-50 active:bg-stone-300"
                    title="发音"
                >
                    <Volume2 size={18} />
                    <span>发音</span>
                </button>
            </div>

            <p className="text-xs text-stone-400 font-sans h-4">
                {mode === 'quiz' ? '请使用鼠标或手指在方格中书写。' : '观看笔顺动画演示。'}
            </p>
        </div>
    );
};

export default HanziPlayer;