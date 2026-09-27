import React from 'react';
import { Trophy, Sparkles, RotateCcw } from 'lucide-react';

interface VictoryModalProps {
  onRestart: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ onRestart }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-yellow-500/70 rounded-2xl shadow-2xl p-6 text-center flex flex-col items-center gap-4">
        {/* Glowing Trophy Icon */}
        <div className="w-16 h-16 rounded-full bg-yellow-500/20 border border-yellow-400/50 flex items-center justify-center text-yellow-300 shadow-lg shadow-yellow-500/30">
          <Trophy className="w-8 h-8 text-yellow-400" />
        </div>

        <h2 className="text-xl font-bold text-yellow-300">
          萬象神鏡重鑄！鏡界大勝利！
        </h2>

        <p className="text-xs text-slate-300 leading-relaxed max-w-md">
          恭喜你！在 3 位分身光靈的攜手協力下，你成功擊退了盤踞於暗影核心的混沌幻影，找回了所有散落的鏡之碎片，萬象稜鏡重現昔日的璀璨光芒！
        </p>

        <div className="flex items-center justify-center gap-1.5 py-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-5 h-8 rounded-sm bg-cyan-400 border border-cyan-200 shadow-md shadow-cyan-400/60"
            />
          ))}
        </div>

        <button
          onClick={onRestart}
          className="mt-2 flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>重啟冒險 (Play Again)</span>
        </button>
      </div>
    </div>
  );
};
