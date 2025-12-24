import React, { useState, useEffect, useRef } from 'react';
import HanziPlayer from './components/HanziPlayer';
import { prefetchStrokeData } from './services/strokeService';
import { PenLine, ArrowRight, Clock, Download, Heart, RefreshCw, X } from 'lucide-react';

const HISTORY_KEY = 'hanzi_flow_history';
const FAVORITES_KEY = 'hanzi_flow_favorites';

const App: React.FC = () => {
    // Default to '汉'
    const [inputChar, setInputChar] = useState<string>('汉');
    const [displayChar, setDisplayChar] = useState<string>('汉');
    const [history, setHistory] = useState<string[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);

    // PWA Install State
    const [showInstallBtn, setShowInstallBtn] = useState(false);

    // Character selection modal state
    const [showCharSelector, setShowCharSelector] = useState(false);
    const [availableChars, setAvailableChars] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load history and check PWA status
    useEffect(() => {
        const saved = localStorage.getItem(HISTORY_KEY);
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }

        const savedFavorites = localStorage.getItem(FAVORITES_KEY);
        if (savedFavorites) {
            try {
                const parsed = JSON.parse(savedFavorites);
                if (Array.isArray(parsed)) {
                    setFavorites(parsed.slice(0, 8));
                }
            } catch (e) {
                console.error("Failed to parse favorites", e);
            }
        }

        // Check if the event was already captured before this component mounted
        if (window.deferredPrompt) {
            setShowInstallBtn(true);
        }

        // Listen for the custom event in case it fires after mount
        const handlePwaReady = () => {
            setShowInstallBtn(true);
        };

        window.addEventListener('pwa-install-ready', handlePwaReady);

        return () => {
            window.removeEventListener('pwa-install-ready', handlePwaReady);
        };
    }, []);

    const handleInstallClick = async () => {
        const promptEvent = window.deferredPrompt;
        if (!promptEvent) return;

        promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;

        if (outcome === 'accepted') {
            setShowInstallBtn(false);
            window.deferredPrompt = null;
        }
    };

    const addToHistory = (char: string) => {
        setHistory(prev => {
            // Remove duplicates and keep only last 8
            const newHistory = [char, ...prev.filter(c => c !== char)].slice(0, 8);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const toggleFavorite = (char: string) => {
        setFavorites(prev => {
            let newFavorites;
            if (prev.includes(char)) {
                newFavorites = prev.filter(c => c !== char);
            } else {
                newFavorites = [char, ...prev].slice(0, 8);
            }
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
            return newFavorites;
        });
    };

    const isFavorite = favorites.includes(displayChar);

    // PREFETCH LOGIC
    useEffect(() => {
        const trimmed = inputChar.trim();
        if (!trimmed) return;

        // Extract all Chinese characters from input
        const chineseChars = trimmed.match(/[\u4e00-\u9fa5]/g) || [];
        if (chineseChars.length === 0) return;

        // If multiple Chinese characters, show selector
        if (chineseChars.length > 1) {
            setAvailableChars(chineseChars);
            setShowCharSelector(true);
        }

        // Prefetch first character
        const timeoutId = setTimeout(() => {
            prefetchStrokeData(chineseChars[0]);
        }, 600);

        return () => clearTimeout(timeoutId);
    }, [inputChar]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = inputChar.trim();
        if (trimmed) {
            const chineseChars = trimmed.match(/[\u4e00-\u9fa5]/g) || [];
            if (chineseChars.length > 1) {
                // Show selector for multiple characters
                setAvailableChars(chineseChars);
                setShowCharSelector(true);
            } else if (chineseChars.length === 1) {
                // Direct display for single character
                const char = chineseChars[0];
                setDisplayChar(char);
                setInputChar(char);
                addToHistory(char);
            }
        }
    };

    const handleCharSelect = (char: string) => {
        setDisplayChar(char);
        setInputChar(char);
        addToHistory(char);
        setShowCharSelector(false);
        setAvailableChars([]);
    };

    const handleCloseSelector = () => {
        setShowCharSelector(false);
        setAvailableChars([]);
    };

    const handleHistoryClick = (char: string) => {
        setDisplayChar(char);
        setInputChar(char);
        addToHistory(char);
    };

    const handleFavoriteClick = (char: string) => {
        setDisplayChar(char);
        setInputChar(char);
        addToHistory(char);
    };

    return (
        <div className="min-h-screen bg-paper-50 text-ink-800 font-sans selection:bg-rose-100 selection:text-rose-900 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-stone-200 sticky top-0 z-50 shadow-sm/50">
                <div className="max-w-5xl mx-auto px-4 h-12 sm:h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-stone-900 text-white p-1.5 rounded-lg">
                            <PenLine size={16} className="sm:w-4 sm:h-4" />
                        </div>
                        <h1 className="text-base sm:text-lg font-serif font-bold tracking-tight text-ink-900">汉字笔顺演示</h1>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-all active:scale-95"
                        title="刷新页面"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </header>

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 flex flex-col items-center">

                {/* Hero Search Section - Compact */}
                <div className="flex flex-col items-center justify-center mb-4 w-full">
                    <form onSubmit={handleSearch} className="relative w-full max-w-[280px] group mb-3">
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputChar}
                                onChange={(e) => setInputChar(e.target.value)}
                                onFocus={(e) => e.target.select()}
                                placeholder="输入汉字..."
                                maxLength={8}
                                className="w-full pl-4 pr-10 py-2.5 bg-white border border-stone-300 rounded-lg shadow-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-100 focus:outline-none transition-all text-center font-serif text-xl placeholder:text-stone-300 placeholder:text-base placeholder:font-sans text-ink-900"
                            />
                            <button
                                type="submit"
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-stone-100 rounded-md text-stone-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                aria-label="搜索"
                            >
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </form>

                    {/* History Chips */}
                    {history.length > 0 && (
                        <div className="flex items-center gap-2 max-w-[340px] overflow-x-auto pb-1 px-1 no-scrollbar justify-center">
                            <span className="text-stone-400 flex-shrink-0" title="历史记录">
                                <Clock size={14} />
                            </span>
                            <div className="flex gap-1.5">
                                {history.map((char) => (
                                    <button
                                        key={char}
                                        onClick={() => handleHistoryClick(char)}
                                        className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-md border text-sm font-serif transition-colors shadow-sm ${displayChar === char
                                                ? 'bg-stone-800 text-white border-stone-800'
                                                : 'bg-white border-stone-200 text-stone-600 hover:border-rose-300 hover:text-rose-600'
                                            }`}
                                    >
                                        {char}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Favorites Chips */}
                    {favorites.length > 0 && (
                        <div className="flex items-center gap-2 max-w-[340px] overflow-x-auto mt-2 pb-1 px-1 no-scrollbar justify-center">
                            <span className="text-rose-400 flex-shrink-0" title="收藏">
                                <Heart size={14} fill="currentColor" />
                            </span>
                            <div className="flex gap-1.5">
                                {favorites.map((char) => (
                                    <button
                                        key={char}
                                        onClick={() => handleFavoriteClick(char)}
                                        className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-md border text-sm font-serif transition-colors shadow-sm ${displayChar === char
                                                ? 'bg-rose-500 text-white border-rose-500'
                                                : 'bg-white border-stone-200 text-stone-600 hover:border-rose-300 hover:text-rose-600'
                                            }`}
                                    >
                                        {char}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Player Section - Compact Card */}
                <div className="w-full max-w-[360px] mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex flex-col items-center">
                        <HanziPlayer
                            char={displayChar}
                            isFavorite={isFavorite}
                            onToggleFavorite={() => toggleFavorite(displayChar)}
                        />
                    </div>
                </div>

                {/* Footer Tips - Compact */}
                <div className="w-full max-w-xl mt-3">
                    <div className="p-4 bg-stone-100/80 rounded-lg text-stone-500 text-xs leading-relaxed border border-stone-200/50">
                        <p className="font-bold mb-1 text-stone-700 flex items-center gap-1.5 justify-center sm:justify-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            书写规则
                        </p>
                        <p className="text-center sm:text-left">
                            先横后竖，先撇后捺，从上到下，从左到右，先外后内，先中间后两边，先里头后封口。
                        </p>
                    </div>
                </div>

            </main>

            {/* Character Selection Modal */}
            {showCharSelector && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-[fadeIn_0.2s_ease-out]">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-serif font-bold text-stone-800">选择汉字</h3>
                            <button
                                onClick={handleCloseSelector}
                                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Character Grid */}
                        <div className="grid grid-cols-4 gap-3">
                            {availableChars.map((char, index) => (
                                <button
                                    key={`${char}-${index}`}
                                    onClick={() => handleCharSelect(char)}
                                    className="aspect-square flex items-center justify-center rounded-xl bg-stone-50 border-2 border-stone-200 hover:border-rose-400 hover:bg-rose-50 text-3xl font-serif text-stone-800 hover:text-rose-600 transition-all active:scale-95 shadow-sm"
                                >
                                    {char}
                                </button>
                            ))}
                        </div>

                        {/* Footer Tip */}
                        <p className="text-xs text-stone-400 text-center mt-4">
                            点击汉字查看笔顺演示
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
