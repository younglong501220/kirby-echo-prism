import React from 'react';
import { GameEngine } from '../game/gameEngine';
import { ABILITIES } from '../game/constants';
import { Volume2, VolumeX, Compass, BookOpen, BatteryCharging } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface HUDProps {
  engine: GameEngine;
  onOpenMap: () => void;
  onOpenGuide: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  engine,
  onOpenMap,
  onOpenGuide,
  isMuted,
  onToggleMute,
}) => {
  const p = engine.player;
  const abilityInfo = ABILITIES[p.ability] || ABILITIES.normal;
  const collectedCount = engine.collectedShards.filter(Boolean).length;

  return (
    <div className="w-full max-w-5xl mx-auto mb-2 px-2 flex flex-col gap-2">
      {/* Top HUD Bar */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2 shadow-lg backdrop-blur-md">
        {/* Left: Player Life & Battery */}
        <div className="flex items-center gap-5">
          {/* Health Gauge */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300">
              <span>體力 (HP)</span>
              <span className="font-mono text-slate-300">
                {p.hp}/{p.maxHp}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: p.maxHp }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-4.5 rounded-xs border border-rose-950 transition-colors ${
                    i < p.hp
                      ? 'bg-gradient-to-t from-rose-600 to-rose-400 shadow-xs shadow-rose-500/50'
                      : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Battery Gauge */}
          <div className="flex flex-col border-l border-slate-700/80 pl-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
              <BatteryCharging className="w-3.5 h-3.5 text-amber-400" />
              <span>通訊器電量</span>
              <span className="font-mono text-slate-300">
                {p.battery}/{p.maxBattery}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              {Array.from({ length: p.maxBattery }).map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-4 rounded border flex items-center justify-center text-[10px] font-bold ${
                    i < p.battery
                      ? 'bg-amber-500 border-amber-300 text-amber-950 shadow-xs shadow-amber-400/50'
                      : 'bg-slate-800/80 border-slate-700 text-slate-500'
                  }`}
                >
                  🔋
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Current Copy Ability */}
        <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-1.5">
          <div className="w-8 h-8 rounded-md bg-slate-700/80 border border-slate-600 flex items-center justify-center text-lg shadow-inner">
            {abilityInfo.icon}
          </div>
          <div className="flex flex-col">
            <div className="text-[11px] text-slate-400">當前複製能力</div>
            <div className="text-xs font-bold text-slate-100">{abilityInfo.name}</div>
          </div>
        </div>

        {/* Right: Master Mirror 8-Shard Jewel & Utility Buttons */}
        <div className="flex items-center gap-4">
          {/* Shards Progress */}
          <div className="flex flex-col items-end">
            <div className="text-[11px] text-slate-400">萬象稜鏡碎片</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-bold text-cyan-300 font-mono">
                {collectedCount}/8
              </span>
              {/* 8-Slice Mini Indicator */}
              <div className="flex items-center gap-0.5">
                {engine.collectedShards.map((hasShard, idx) => (
                  <div
                    key={idx}
                    title={`第 ${idx + 1} 塊碎片 (${hasShard ? '已獲得' : '未尋得'})`}
                    className={`w-2.5 h-3.5 rounded-xs border transition-all ${
                      hasShard
                        ? 'bg-cyan-400 border-cyan-200 shadow-sm shadow-cyan-400/50'
                        : 'bg-slate-800 border-slate-700 opacity-60'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Modals / Audio Toggle */}
          <div className="flex items-center gap-1.5 border-l border-slate-700/80 pl-3">
            <button
              onClick={onOpenGuide}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
              title="能力與操作指南"
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenMap}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
              title="查看迷宮地圖"
            >
              <Compass className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleMute}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
              title={isMuted ? '開啟音樂音效' : '靜音'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mouth Full or Companion Alert Banner */}
      {p.mouthFull && (
        <div className="flex items-center justify-between bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs px-3.5 py-1.5 rounded-lg animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-base">👄</span>
            <span>
              已含住敵物！按 <span className="font-bold text-amber-300 underline">[S 或 ↓]</span> 吞嚥吸收能力，或按 <span className="font-bold text-amber-300 underline">[J 或 Z]</span> 吐出貫穿星型彈！
            </span>
          </div>
          <span className="text-[11px] text-amber-300/80 font-mono">
            {p.mouthFullAbility ? `可獲得: ${p.mouthFullAbility.toUpperCase()}` : '無特殊能力 (星彈)'}
          </span>
        </div>
      )}
    </div>
  );
};
