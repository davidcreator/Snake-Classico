import React from 'react';
import { Play, Gamepad2, Keyboard, Smartphone, Sparkles, ShieldAlert, Zap, Box, Compass, Skull, Rainbow, Trophy, Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../game/SoundEngine';

export function MainMenu({ selectedMode, setSelectedMode, controlType, setControlType, isMuted, setIsMuted, onStartGame }) {
    const modes = [
        { id: 'classic', name: 'Clássico', icon: Sparkles, color: 'emerald', desc: 'Jogo clássico e balanceado' },
        { id: 'speed', name: 'Velocidade', icon: Zap, color: 'amber', desc: 'Acelera progressivamente a cada nível' },
        { id: 'obstacles', name: 'Obstáculos', icon: Box, color: 'slate', desc: 'Paredes e bloqueios surgem no mapa' },
        { id: 'portal', name: 'Portal', icon: Compass, color: 'cyan', desc: 'Atravesse as bordas do mapa' },
        { id: 'survival', name: 'Sobrevivência', icon: Skull, color: 'rose', desc: 'Comidas venenosas encolhem a cobra' },
        { id: 'rainbow', name: 'Arco-íris', icon: Rainbow, color: 'purple', desc: 'Comidas coloridas com bônus de pontos' },
    ];

    const toggleMute = () => {
        const nextMuted = !isMuted;
        setIsMuted(nextMuted);
        soundEngine.setMuted(nextMuted);
    };

    const storedKey = `snake_highscore_${selectedMode}`;
    const highScore = localStorage.getItem(storedKey) || '0';

    return (
        <div className="w-full max-w-2xl mx-auto bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-emerald-500/30">
                        🐍
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                            Snake Clássico <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">PRO</span>
                        </h1>
                        <p className="text-xs text-slate-400 font-medium">
                            Arquitetura React + Phaser 3 | House Software Studio
                        </p>
                    </div>
                </div>

                <button
                    onClick={toggleMute}
                    className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                    title={isMuted ? "Ativar Áudio" : "Desativar Áudio"}
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>

            {/* Controls Selection */}
            <div className="mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Tipo de Controle
                </label>
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={() => { soundEngine.playClick(); setControlType('keyboard'); }}
                        className={`py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 border transition ${
                            controlType === 'keyboard'
                                ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                    >
                        <Keyboard size={16} /> Teclado (WASD)
                    </button>
                    <button
                        onClick={() => { soundEngine.playClick(); setControlType('gamepad'); }}
                        className={`py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 border transition ${
                            controlType === 'gamepad'
                                ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                    >
                        <Gamepad2 size={16} /> Gamepad / USB
                    </button>
                    <button
                        onClick={() => { soundEngine.playClick(); setControlType('touch'); }}
                        className={`py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 border transition ${
                            controlType === 'touch'
                                ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                    >
                        <Smartphone size={16} /> Touch / Mobile
                    </button>
                </div>
            </div>

            {/* Modes Grid */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Modo de Jogo
                    </label>
                    <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
                        <Trophy size={14} /> Recorde Modo: <strong className="text-white">{highScore} pts</strong>
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {modes.map((m) => {
                        const Icon = m.icon;
                        const isSelected = selectedMode === m.id;
                        return (
                            <button
                                key={m.id}
                                onClick={() => { soundEngine.playClick(); setSelectedMode(m.id); }}
                                className={`p-3.5 rounded-2xl text-left border transition relative overflow-hidden flex flex-col justify-between ${
                                    isSelected
                                        ? 'bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-xl'
                                        : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/70'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400'}`}>
                                        <Icon size={18} />
                                    </div>
                                    {isSelected && (
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    )}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white mb-0.5">{m.name}</div>
                                    <div className="text-[11px] text-slate-400 line-clamp-2 leading-tight">{m.desc}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Start Button */}
            <button
                onClick={onStartGame}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3 transition transform active:scale-[0.99]"
            >
                <Play size={22} className="fill-slate-950" /> Iniciar Partida
            </button>
        </div>
    );
}
