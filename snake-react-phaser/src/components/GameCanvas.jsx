import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameScene } from '../game/scenes/GameScene';

export function GameCanvas({ mode, controlType }) {
    const containerRef = useRef(null);
    const gameRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const config = {
            type: Phaser.AUTO,
            width: 600,
            height: 600,
            parent: containerRef.current,
            backgroundColor: '#090d16',
            physics: {
                default: 'arcade'
            },
            scene: [GameScene],
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            }
        };

        const game = new Phaser.Game(config);
        gameRef.current = game;

        // Start scene with props
        game.scene.start('GameScene', { mode, controlType });

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, [mode, controlType]);

    return (
        <div className="relative w-full max-w-[600px] aspect-square mx-auto rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500/30 bg-slate-950 flex items-center justify-center">
            <div ref={containerRef} className="w-full h-full flex items-center justify-center" />
        </div>
    );
}
