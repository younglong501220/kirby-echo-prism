import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '../game/gameEngine';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../game/constants';
import { Compass, Sparkles, Phone, CornerRightUp, ArrowDown } from 'lucide-react';

interface GameCanvasProps {
  engine: GameEngine;
  onOpenMap: () => void;
  onOpenGuide: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ engine, onOpenMap, onOpenGuide }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [touchEnabled, setTouchEnabled] = useState(false);

  // Detect touch device
  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setTouchEnabled(true);
    }
  }, []);

  // Keyboard input listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default page scroll on arrow keys and spacebar
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Spacebar'].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key.toLowerCase() === 'm') {
        onOpenMap();
        return;
      }
      engine.keys[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engine.keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [engine, onOpenMap]);

  // Main 60fps render loop
  useEffect(() => {
    let animId: number;

    const loop = () => {
      engine.update();

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false; // preserve crisp retro pixels
          engine.renderer.render(
            ctx,
            engine.currentRoom,
            engine.player,
            engine.companions,
            engine.enemies,
            engine.projectiles,
            engine.particles,
            engine.droppedStars,
            engine.items,
            engine.collectedShards
          );
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [engine]);

  // Virtual touch button handlers
  const handleTouchKey = useCallback((key: string, isPressed: boolean) => {
    engine.keys[key.toLowerCase()] = isPressed;
  }, [engine]);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center w-full max-w-5xl mx-auto select-none"
    >
      {/* Canvas Frame with retro console border */}
      <div className="relative rounded-2xl p-2 md:p-3 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-2 border-slate-600/60 shadow-2xl shadow-purple-950/40">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full max-w-[840px] aspect-[16/9] rounded-lg border border-slate-700 shadow-inner bg-slate-950 cursor-crosshair block"
        />

        {/* Ambient Room Indicator Watermark in corner */}
        <div className="absolute top-5 left-5 pointer-events-none flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded border border-slate-700 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium">{engine.currentRoom.name}</span>
        </div>
      </div>

      {/* Onscreen Touch & Gamepad Controls for Mobile/Tablet or Quick Click */}
      <div className="w-full max-w-[840px] mt-3 px-2 flex items-center justify-between gap-4">
        {/* D-Pad */}
        <div className="flex items-center gap-1.5">
          <button
            onPointerDown={() => handleTouchKey('a', true)}
            onPointerUp={() => handleTouchKey('a', false)}
            onPointerLeave={() => handleTouchKey('a', false)}
            className="w-12 h-12 rounded-lg bg-slate-800 active:bg-purple-600 border border-slate-700 text-slate-200 font-bold flex items-center justify-center text-sm shadow active:scale-95 transition-transform"
            title="向左移動 (A / ←)"
          >
            ◀
          </button>
          <div className="flex flex-col gap-1.5">
            <button
              onPointerDown={() => handleTouchKey('w', true)}
              onPointerUp={() => handleTouchKey('w', false)}
              onPointerLeave={() => handleTouchKey('w', false)}
              className="w-12 h-12 rounded-lg bg-slate-800 active:bg-purple-600 border border-slate-700 text-slate-200 font-bold flex items-center justify-center text-sm shadow active:scale-95 transition-transform"
              title="跳躍 / 空中浮空 (W / ↑ / 空白鍵)"
            >
              ▲
            </button>
            <button
              onPointerDown={() => handleTouchKey('s', true)}
              onPointerUp={() => handleTouchKey('s', false)}
              onPointerLeave={() => handleTouchKey('s', false)}
              className="w-12 h-12 rounded-lg bg-slate-800 active:bg-purple-600 border border-slate-700 text-slate-200 font-bold flex items-center justify-center text-sm shadow active:scale-95 transition-transform"
              title="蹲下 / 吞嚥能力 / 滑鏟 (S / ↓)"
            >
              ▼
            </button>
          </div>
          <button
            onPointerDown={() => handleTouchKey('d', true)}
            onPointerUp={() => handleTouchKey('d', false)}
            onPointerLeave={() => handleTouchKey('d', false)}
            className="w-12 h-12 rounded-lg bg-slate-800 active:bg-purple-600 border border-slate-700 text-slate-200 font-bold flex items-center justify-center text-sm shadow active:scale-95 transition-transform"
            title="向右移動 (D / →)"
          >
            ▶
          </button>
        </div>

        {/* Action Buttons: Phone & Map */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => engine.callCompanions()}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 border border-amber-500/50 rounded-lg text-amber-300 text-xs font-semibold shadow transition-all"
            title="星晶通訊器：呼叫 3 位分身隊友支援 (快捷鍵 C)"
          >
            <Phone className="w-4 h-4 text-amber-400" />
            <span>通訊呼叫 [C]</span>
          </button>

          <button
            onClick={onOpenMap}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 active:scale-95 border border-indigo-500/50 rounded-lg text-indigo-300 text-xs font-semibold shadow transition-all"
            title="迷宮地圖查看器 (快捷鍵 M)"
          >
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>迷宮地圖 [M]</span>
          </button>
        </div>

        {/* Right Action buttons: Inhale/Attack, Jump, Discard */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => engine.dropCurrentAbility()}
            className="w-11 h-11 rounded-lg bg-rose-500/20 active:bg-rose-500/40 border border-rose-500/40 text-rose-300 font-bold flex flex-col items-center justify-center text-[10px] shadow active:scale-95 transition-transform"
            title="丟棄當前能力星 (K / X)"
          >
            <span>丟棄</span>
            <span className="text-[9px] text-rose-400 font-mono">[X]</span>
          </button>

          <button
            onPointerDown={() => handleTouchKey('j', true)}
            onPointerUp={() => handleTouchKey('j', false)}
            onPointerLeave={() => handleTouchKey('j', false)}
            className="w-13 h-13 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 border border-purple-400 text-white font-bold flex flex-col items-center justify-center text-xs shadow-lg active:scale-95 transition-transform"
            title="吸入 / 攻擊 / 吐出星彈 (J / Z)"
          >
            <span>吸入/攻擊</span>
            <span className="text-[9px] text-purple-200 font-mono">[J]</span>
          </button>

          <button
            onPointerDown={() => handleTouchKey('w', true)}
            onPointerUp={() => handleTouchKey('w', false)}
            onPointerLeave={() => handleTouchKey('w', false)}
            className="w-13 h-13 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 border border-emerald-400 text-white font-bold flex flex-col items-center justify-center text-xs shadow-lg active:scale-95 transition-transform"
            title="跳躍 / 多段浮空飛行 (W / 空白鍵)"
          >
            <span>跳躍/浮空</span>
            <span className="text-[9px] text-emerald-200 font-mono">[W/空格]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
