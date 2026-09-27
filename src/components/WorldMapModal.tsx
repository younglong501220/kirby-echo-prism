import React from 'react';
import { GameEngine } from '../game/gameEngine';
import { SECTORS } from '../game/constants';
import { X, MapPin, Sparkles, Key, Compass } from 'lucide-react';

interface WorldMapModalProps {
  engine: GameEngine;
  onClose: () => void;
}

export const WorldMapModal: React.FC<WorldMapModalProps> = ({ engine, onClose }) => {
  const roomsList = Array.from(engine.rooms.values());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <Compass className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100">
                鏡之大迷宮全域地圖 (Metroidvania World Map)
              </h2>
              <p className="text-xs text-slate-400">
                探索 8 個異界迷宮領域，尋回散落的 8 塊萬象稜鏡碎片
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Grid Canvas Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950/90 flex flex-col gap-6">
          {/* Sector Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SECTORS.map((sec) => {
              const hasShard = sec.shardIndex >= 0 ? engine.collectedShards[sec.shardIndex] : null;
              const isCurrentSector = engine.currentRoom.sectorId === sec.id;

              return (
                <div
                  key={sec.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isCurrentSector
                      ? 'bg-slate-800/90 border-purple-500 shadow-md shadow-purple-500/20'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{sec.name}</span>
                    {hasShard !== null && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          hasShard
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {hasShard ? '★ 碎片已取' : '未解鎖'}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {sec.description}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Node Map */}
          <div className="relative w-full h-[380px] bg-slate-900/80 border border-slate-800 rounded-xl p-4 overflow-hidden">
            <div className="absolute top-3 left-4 text-xs font-semibold text-slate-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
              <span>粉紅亮點：光靈當前所在房間</span>
            </div>

            {/* Render Rooms by Grid Coordinate */}
            <div className="relative w-full h-full flex items-center justify-center">
              {roomsList.map((room) => {
                const isVisited = engine.visitedRoomIds.has(room.id);
                const isCurrent = engine.currentRoomId === room.id;

                // Position on schematic 8x6 grid
                const leftPercent = (room.gridX / 8) * 90 + 5;
                const topPercent = (room.gridY / 6) * 80 + 10;

                return (
                  <div
                    key={room.id}
                    style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-28 p-2 rounded-lg border text-center transition-all ${
                      isCurrent
                        ? 'bg-purple-900/90 border-pink-400 shadow-lg shadow-pink-500/30 ring-2 ring-pink-500'
                        : isVisited
                        ? 'bg-slate-800 border-slate-700 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800/40 opacity-40'
                    }`}
                  >
                    <div className="text-[11px] font-bold truncate text-slate-200">
                      {isVisited ? room.name : '？？？'}
                    </div>

                    {isVisited && (
                      <div className="flex items-center justify-center gap-1 mt-1 text-[10px] text-slate-400">
                        {room.doors.some(d => d.isMirrorPortal) && <span title="神殿鏡門">🪞</span>}
                        {room.puzzles.length > 0 && <span title="機關謎題">🧩</span>}
                        {room.chests.some(c => c.type === 'shard') && <span title="鏡之碎片">💎</span>}
                      </div>
                    )}

                    {isCurrent && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold shadow animate-bounce">
                        YOU
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div>
            已探索房間數：
            <span className="font-bold text-slate-200 font-mono ml-1">
              {engine.visitedRoomIds.size} / {engine.rooms.size}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 text-xs font-medium transition-colors"
          >
            關閉地圖 [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
