
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ApiKeyModal from './components/ApiKeyModal';
import { getGeminiHint } from './services/geminiService';
import { GameHistory, GameStatus } from './types';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [userGuess, setUserGuess] = useState<string>('');
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [status, setStatus] = useState<GameStatus>(GameStatus.INITIAL);
  const [isLoadingHint, setIsLoadingHint] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const startNewGame = useCallback(() => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
    setHistory([]);
    setUserGuess('');
    setStatus(GameStatus.PLAYING);
  }, []);

  useEffect(() => {
    if (apiKey && status === GameStatus.INITIAL) {
      startNewGame();
    }
  }, [apiKey, status, startNewGame]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) return;
    
    const guessNum = parseInt(userGuess);
    if (isNaN(guessNum) || guessNum < 1 || guessNum > 100) {
      alert("Please enter a valid number between 1 and 100.");
      return;
    }

    setIsLoadingHint(true);
    const hint = await getGeminiHint(apiKey, targetNumber, guessNum, history);
    
    const newEntry: GameHistory = {
      guess: guessNum,
      hint: hint,
      timestamp: Date.now()
    };

    setHistory(prev => [...prev, newEntry]);
    setUserGuess('');
    setIsLoadingHint(false);

    if (guessNum === targetNumber) {
      setStatus(GameStatus.WON);
    }
  };

  if (!apiKey) {
    return <ApiKeyModal onSuccess={(key) => setApiKey(key)} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col h-screen">
      <header className="text-center mb-8 shrink-0">
        <h1 className="text-5xl font-black mb-2 tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-emerald-400 to-indigo-500">
          GEMINI GUESS
        </h1>
        <p className="text-slate-400 text-lg">Can you find the secret number between 1 and 100?</p>
      </header>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Main Interaction Area */}
        <div className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-3xl p-6 flex flex-col backdrop-blur-md">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">Attempt #{history.length + 1}</span>
              {status === GameStatus.WON && (
                <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  LEVEL COMPLETE
                </span>
              )}
            </div>
            
            {status === GameStatus.PLAYING ? (
              <form onSubmit={handleGuess} className="relative group">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={userGuess}
                  onChange={(e) => setUserGuess(e.target.value)}
                  placeholder="Type your guess..."
                  disabled={isLoadingHint}
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl py-6 px-8 text-4xl font-bold text-center focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-800"
                />
                <button
                  type="submit"
                  disabled={isLoadingHint || !userGuess}
                  className="absolute right-3 top-3 bottom-3 px-8 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl font-bold transition-all active:scale-95 shadow-xl shadow-blue-500/20"
                >
                  {isLoadingHint ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : 'GO'}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-6 py-8">
                <div className="text-7xl font-black text-emerald-400 animate-bounce">{targetNumber}</div>
                <h3 className="text-2xl font-bold">Incredible! You found it!</h3>
                <button
                  onClick={startNewGame}
                  className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-xl hover:bg-emerald-400 hover:text-white transition-all transform hover:-translate-y-1 shadow-2xl"
                >
                  PLAY AGAIN
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest px-2">AI Insights</h4>
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto space-y-4 pr-2 scroll-smooth"
            >
              {history.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-600 italic text-sm">
                  Waiting for your first move...
                </div>
              ) : (
                [...history].reverse().map((item, idx) => (
                  <div 
                    key={item.timestamp}
                    className={`p-4 rounded-2xl border ${idx === 0 ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-900/50 border-slate-700/50 opacity-60'}`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <span className="bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded text-xs">Guess: {item.guess}</span>
                    </div>
                    <p className="text-slate-200 text-sm leading-relaxed">{item.hint}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="w-full md:w-64 flex flex-col gap-6">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-6">
            <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">Quick Stats</h4>
            <div className="space-y-4">
              <div>
                <div className="text-slate-400 text-xs mb-1">Total Guesses</div>
                <div className="text-2xl font-bold font-mono">{history.length}</div>
              </div>
              <div className="pt-4 border-t border-slate-700/50">
                <div className="text-slate-400 text-xs mb-1">Last Guess</div>
                <div className="text-2xl font-bold font-mono">
                  {history.length > 0 ? history[history.length-1].guess : '-'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-6">
            <h4 className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-3">AI Engine</h4>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-medium text-slate-300">Gemini 3 Flash</span>
            </div>
            <p className="mt-3 text-[10px] text-slate-400 leading-tight">
              Using your validated API key to generate contextual game master commentary.
            </p>
          </div>
        </div>
      </div>
      
      <footer className="mt-8 shrink-0 text-center text-[10px] text-slate-600">
        POWERED BY GOOGLE GENERATIVE AI &bull; BUILT WITH REACT & TAILWIND
      </footer>
    </div>
  );
};

export default App;
