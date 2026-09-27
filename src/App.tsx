/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine } from './game/gameEngine';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { WorldMapModal } from './components/WorldMapModal';
import { AbilityGuideModal } from './components/AbilityGuideModal';
import { VictoryModal } from './components/VictoryModal';
import { soundManager } from './audio/soundManager';
import { Compass, BookOpen, RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';

export default function App() {
  const engineRef = useRef<GameEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new GameEngine();
  }
  const engine = engineRef.current;

  // React state for HUD updates
  const [, setTick] = useState(0);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Bind engine event listeners
  useEffect(() => {
    engine.onStateChange = () => {
      setTick((t) => t + 1);
    };

    engine.onVictory = () => {
      setIsVictory(true);
    };

    // Global keyboard shortcuts for modals
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMapOpen(false);
        setIsGuideOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => {
      window.removeEventListener('keydown', handleGlobalKey);
    };
  }, [engine]);

  const handleToggleMute = useCallback(() => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  }, []);

  const handleRestart = useCallback(() => {
    engineRef.current = new GameEngine();
    setIsVictory(false);
    setIsMapOpen(false);
    setIsGuideOpen(false);
    setTick((t) => t + 1);
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0f17] text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Top Bar Contract: 3 zones */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight text-slate-100">
            鏡界光靈：碎片迷宮
          </span>
          <span className="hidden sm:inline text-xs text-slate-500 font-mono">
            Echo of the Prism
          </span>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            onClick={() => engine.loadRoom('room_sanctuary_hub', 300, 260)}
            className="hover:text-slate-100 transition-colors"
          >
            中央神殿
          </button>
          <button
            onClick={() => setIsMapOpen(true)}
            className="hover:text-slate-100 transition-colors"
          >
            迷宮地圖
          </button>
          <button
            onClick={() => setIsGuideOpen(true)}
            className="hover:text-slate-100 transition-colors"
          >
            複製能力指南
          </button>
          <button
            onClick={() => engine.callCompanions()}
            className="hover:text-slate-100 transition-colors"
          >
            通訊呼叫分身
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMapOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-500 active:scale-95 rounded-lg shadow-sm transition-all whitespace-nowrap"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>迷宮地圖</span>
          </button>
          <button
            onClick={handleRestart}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            title="重新開始遊戲"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置</span>
          </button>
        </div>
      </header>

      {/* Main Playable Stage */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 md:p-6 w-full max-w-6xl mx-auto">
        {/* Game HUD */}
        <HUD
          engine={engine}
          onOpenMap={() => setIsMapOpen(true)}
          onOpenGuide={() => setIsGuideOpen(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />

        {/* 60fps Canvas Stage */}
        <GameCanvas
          engine={engine}
          onOpenMap={() => setIsMapOpen(true)}
          onOpenGuide={() => setIsGuideOpen(true)}
        />

        {/* Clean Unboxed Footer Metadata (Anti-Pill Discipline) */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-400">
          <span>致敬《星之卡比 鏡之大迷宮》四大核心</span>
          <span aria-hidden="true">·</span>
          <span>8 區域非線性銀河惡魔城迷宮</span>
          <span aria-hidden="true">·</span>
          <span>吸入與複製能力系統 (劍士/烈焰/重鎚/雷電/飛刃)</span>
          <span aria-hidden="true">·</span>
          <span>星晶通訊器 (呼叫 3 位分身隊友)</span>
          <span aria-hidden="true">·</span>
          <span>環境元素解謎 (砍蔓藤/融冰塊/砸地樁/充電)</span>
        </div>
      </main>

      {/* Modals */}
      {isMapOpen && (
        <WorldMapModal engine={engine} onClose={() => setIsMapOpen(false)} />
      )}

      {isGuideOpen && (
        <AbilityGuideModal onClose={() => setIsGuideOpen(false)} />
      )}

      {isVictory && (
        <VictoryModal onRestart={handleRestart} />
      )}
    </div>
  );
}
