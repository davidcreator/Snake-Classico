import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Trophy, Award } from 'lucide-react';

export function GameOverOverlay({ stats, onRestart, onMenu }) {
    useEffect(() => {
        // High score check
        const storedKey = `snake_highscore_${stats.mode}`;
        const prevHigh = parseInt(localStorage.getItem(storedKey) || '0', 10);
        if (stats.score > prevHigh && stats.score > 0) {
            localStorage.setItem(storedKey, stats.score.toString());
            // Trigger victory confetti
            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }, [stats]);

    const storedKey = `snake_highscore_${stats.mode}`;
    const highScore = Math.max(stats.score, parseInt(localStorage.getItem(storedKey) || '0', 10));

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-900 border-2 border-rose-500/50 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl text-center text-white relative overflow-hidden">
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

                <div className="inline-flex p-3 bg-rose-500/10 text-rose-400 rounded-2xl mb-3 border border-rose-500/20">
                    <Trophy size={36} />
                </div>

                <h2 className="text-3xl font-extrabold text-rose-400 tracking-tight mb-1">
                    Game Over!
                </h2>
                <p className="text-slate-400 text-xs mb-6 font-medium">
                    {stats.reason || 'Você colidiu e a partida terminou.'}
                </p>

                <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 mb-6 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Pontuação Final</span>
                        <span className="text-2xl font-mono font-extrabold text-emerald-400">{stats.score}</span>
                    </div>
                    <div className="h-px bg-slate-700/50" />
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Recorde ({stats.mode})</span>
                        <span className="text-lg font-mono font-bold text-amber-400 flex items-center gap-1">
                            <Award size={16} /> {highScore}
                        </span>
                    </div>
                    <div className="h-px bg-slate-700/50" />
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Nível Alcançado</span>
                        <span className="text-base font-mono font-semibold text-slate-200">Nível {stats.level}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onRestart}
                        className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/30"
                    >
                        <RotateCcw size={18} /> Jogar Novamente
                    </button>
                    <button
                        onClick={onMenu}
                        className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl flex items-center justify-center transition border border-slate-700"
                        title="Menu Principal"
                    >
                        <Home size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
