import React, { useState, useEffect } from 'react';
import { MainMenu } from './components/MainMenu';
import { HUD } from './components/HUD';
import { GameCanvas } from './components/GameCanvas';
import { MobileControls } from './components/MobileControls';
import { GameOverOverlay } from './components/GameOverOverlay';
import { EventBus } from './game/EventBus';
import { soundEngine } from './game/SoundEngine';

export default function App() {
    const [gameState, setGameState] = useState('menu'); // 'menu' | 'playing'
    const [selectedMode, setSelectedMode] = useState('classic');
    const [controlType, setControlType] = useState('keyboard');
    const [isMuted, setIsMuted] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);

    const [stats, setStats] = useState({
        score: 0,
        level: 1,
        speed: 1,
        mode: 'classic',
        reason: ''
    });

    useEffect(() => {
        const onGameUpdate = (data) => {
            setStats(prev => ({ ...prev, ...data }));
        };

        const onGameOver = (data) => {
            setStats(prev => ({ ...prev, ...data }));
            setIsGameOver(true);
        };

        const onPauseChanged = (paused) => {
            setIsPaused(paused);
        };

        EventBus.on('game-update', onGameUpdate);
        EventBus.on('game-over', onGameOver);
        EventBus.on('pause-changed', onPauseChanged);

        return () => {
            EventBus.off('game-update', onGameUpdate);
            EventBus.off('game-over', onGameOver);
            EventBus.off('pause-changed', onPauseChanged);
        };
    }, []);

    const handleStartGame = () => {
        soundEngine.playClick();
        setIsGameOver(false);
        setIsPaused(false);
        setStats({
            score: 0,
            level: 1,
            speed: 1,
            mode: selectedMode,
            reason: ''
        });
        setGameState('playing');
    };

    const handleRestart = () => {
        soundEngine.playClick();
        setIsGameOver(false);
        setIsPaused(false);
        setStats({
            score: 0,
            level: 1,
            speed: 1,
            mode: selectedMode,
            reason: ''
        });
        // Resetting game state triggers re-mount of GameCanvas cleanly
        setGameState('menu');
        setTimeout(() => {
            setGameState('playing');
        }, 50);
    };

    const handleBackToMenu = () => {
        soundEngine.playClick();
        setIsGameOver(false);
        setIsPaused(false);
        setGameState('menu');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-emerald-500 selection:text-slate-950 font-sans">
            {gameState === 'menu' && (
                <MainMenu
                    selectedMode={selectedMode}
                    setSelectedMode={setSelectedMode}
                    controlType={controlType}
                    setControlType={setControlType}
                    isMuted={isMuted}
                    setIsMuted={setIsMuted}
                    onStartGame={handleStartGame}
                />
            )}

            {gameState === 'playing' && (
                <div className="w-full flex flex-col items-center animate-fade-in">
                    <HUD
                        stats={stats}
                        isPaused={isPaused}
                        isMuted={isMuted}
                        setIsMuted={setIsMuted}
                        onMenuClick={handleBackToMenu}
                    />

                    <GameCanvas mode={selectedMode} controlType={controlType} />

                    {controlType === 'touch' && <MobileControls />}
                </div>
            )}

            {isGameOver && (
                <GameOverOverlay
                    stats={stats}
                    onRestart={handleRestart}
                    onMenu={handleBackToMenu}
                />
            )}
        </div>
    );
}
