import React from 'react';
import { Pause, Play, Volume2, VolumeX, Home } from 'lucide-react';
import { EventBus } from '../game/EventBus';
import { soundEngine } from '../game/SoundEngine';

export function HUD({ stats, isPaused, isMuted, setIsMuted, onMenuClick }) {
    const togglePause = () => {
        EventBus.emit('control-pause');
    };

    const toggleMute = () => {
        const nextMuted = !isMuted;
        setIsMuted(nextMuted);
        soundEngine.setMuted(nextMuted);
    };

    const modeLabels = {
        classic: '🎯 Clássico',
        speed: '⚡ Velocidade',
        obstacles: '🧱 Obstáculos',
        portal: '🌀 Portal',
        survival: '💀 Sobrevivência',
        rainbow: '🌈 Arco-íris'
    };

    return (
        <div className="w-full max-w-[600px] mx-auto mb-3 bg-slate-900/90 backdrop-blur border border-slate-700/60 rounded-xl p-3 px-4 flex items-center justify-between shadow-lg text-white">
            <div className="flex items-center gap-4 text-sm font-semibold">
                <div className="flex flex-col">
                    <span className="text-xs text-slate-400">Pontos</span>
                    <span className="text-xl text-emerald-400 font-mono font-extrabold">{stats.score}</span>
                </div>
                <div className="h-8 w-px bg-slate-700" />
                <div className="flex flex-col">
                    <span className="text-xs text-slate-400">Nível</span>
                    <span className="text-lg text-amber-400 font-mono font-bold">{stats.level}</span>
                </div>
                <div className="h-8 w-px bg-slate-700" />
                <div className="flex flex-col">
                    <span className="text-xs text-slate-400">Velocidade</span>
                    <span className="text-lg text-cyan-400 font-mono font-bold">{stats.speed}x</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block px-2.5 py-1 text-xs font-bold rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    {modeLabels[stats.mode] || stats.mode}
                </span>

                <button
                    onClick={toggleMute}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title={isMuted ? "Ativar Áudio" : "Desativar Áudio"}
                >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>

                <button
                    onClick={togglePause}
                    className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1 text-xs transition"
                >
                    {isPaused ? <Play size={16} /> : <Pause size={16} />}
                    <span className="hidden xs:inline">{isPaused ? 'Continuar' : 'Pausar'}</span>
                </button>

                <button
                    onClick={onMenuClick}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Menu Principal"
                >
                    <Home size={18} />
                </button>
            </div>
        </div>
    );
}
