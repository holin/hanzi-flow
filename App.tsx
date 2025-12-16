import React, { useState, useEffect } from 'react';
import HanziPlayer from './components/HanziPlayer';
import { prefetchStrokeData } from './services/strokeService';
import { PenLine, ArrowRight, Clock, Download } from 'lucide-react';

const HISTORY_KEY = 'hanzi_flow_history';

const App: React.FC = () => {
    // Default to '汉'
    const [inputChar, setInputChar] = useState<string>('汉');
    const [displayChar, setDisplayChar] = useState<string>('汉');
    const [history, setHistory] = useState<string[]>([]);

    // PWA Install State
    const [showInstallBtn, setShowInstallBtn] = useState(false);

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

    // PREFETCH LOGIC
    useEffect(() => {
        const trimmed = inputChar.trim();
        if (!trimmed) return;

        const potentialChar = trimmed.charAt(0);
        if (!/[\u4e00-\u9fa5]/.test(potentialChar)) return;

        const timeoutId = setTimeout(() => {
            console.log(`Prefetching data for: ${potentialChar}`);
            prefetchStrokeData(potentialChar);
        }, 600);

        return () => clearTimeout(timeoutId);
    }, [inputChar]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = inputChar.trim();
        if (trimmed) {
            const firstChar = trimmed.charAt(0);
            if (/[\u4e00-\u9fa5]/.test(firstChar)) {
                setDisplayChar(firstChar);
                setInputChar(firstChar);
                addToHistory(firstChar);
            }
        }
    };

    const handleHistoryClick = (char: string) => {
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
                        <h1 className="text-base sm:text-lg font-serif font-bold tracking-tight text-ink-900">Hanzi Flow</h1>
                    </div>
                    {showInstallBtn && (
                        <button
                            onClick={handleInstallClick}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-full hover:bg-rose-600 transition-colors shadow-sm"
                        >
                            <Download size={14} />
                            安装 App
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 flex flex-col items-center">

                {/* Hero Search Section - Compact */}
                <div className="flex flex-col items-center justify-center mb-4 w-full">
                    <div className="text-center mb-3">
                        <h2 className="text-xl sm:text-2xl font-serif font-bold text-ink-900 mb-1">
                            汉字笔顺演示
                        </h2>
                    </div>

                    <form onSubmit={handleSearch} className="relative w-full max-w-[280px] group mb-3">
                        <div className="relative">
                            <input
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
                                        className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-md border text-sm font-serif transition-colors shadow-sm ${
                                            displayChar === char
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
                </div>

                {/* Player Section - Compact Card */}
                <div className="w-full max-w-[360px] mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex flex-col items-center">
                        <HanziPlayer char={displayChar} />
                    </div>
                </div>

                {/* Footer Tips - Compact */}
                <div className="w-full max-w-xl mt-auto mb-10">
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
        </div>
    );
};

export default App;