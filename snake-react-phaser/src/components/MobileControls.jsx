import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { EventBus } from '../game/EventBus';

export function MobileControls() {
    const sendDir = (dir) => {
        EventBus.emit('control-direction', dir);
    };

    return (
        <div className="w-full max-w-[600px] mx-auto mt-4 grid grid-cols-3 gap-2 p-2 max-w-[240px] select-none">
            <div />
            <button
                onPointerDown={() => sendDir('UP')}
                className="w-14 h-14 bg-slate-800 active:bg-emerald-600 rounded-xl border border-slate-700 flex items-center justify-center text-white shadow-lg touch-manipulation active:scale-95 transition"
            >
                <ArrowUp size={24} />
            </button>
            <div />

            <button
                onPointerDown={() => sendDir('LEFT')}
                className="w-14 h-14 bg-slate-800 active:bg-emerald-600 rounded-xl border border-slate-700 flex items-center justify-center text-white shadow-lg touch-manipulation active:scale-95 transition"
            >
                <ArrowLeft size={24} />
            </button>
            <button
                onPointerDown={() => sendDir('DOWN')}
                className="w-14 h-14 bg-slate-800 active:bg-emerald-600 rounded-xl border border-slate-700 flex items-center justify-center text-white shadow-lg touch-manipulation active:scale-95 transition"
            >
                <ArrowDown size={24} />
            </button>
            <button
                onPointerDown={() => sendDir('RIGHT')}
                className="w-14 h-14 bg-slate-800 active:bg-emerald-600 rounded-xl border border-slate-700 flex items-center justify-center text-white shadow-lg touch-manipulation active:scale-95 transition"
            >
                <ArrowRight size={24} />
            </button>
        </div>
    );
}
