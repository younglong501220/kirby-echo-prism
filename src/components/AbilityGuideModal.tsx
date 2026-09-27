import React from 'react';
import { ABILITIES } from '../game/constants';
import { X, BookOpen, Sparkles, Phone, ShieldAlert, Cpu } from 'lucide-react';

interface AbilityGuideModalProps {
  onClose: () => void;
}

export const AbilityGuideModal: React.FC<AbilityGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100">
                操作與複製能力指南 (Manual & Ability Guide)
              </h2>
              <p className="text-xs text-slate-400">
                致敬《星之卡比 鏡之大迷宮》的核心機制與環境元素解謎矩陣
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

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6 text-sm text-slate-300">
          {/* Section 1: Classic Kirby Basic Moves */}
          <div>
            <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              基礎動作指令
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="font-bold text-slate-100">移動：</span>
                <span className="text-amber-300 font-mono ml-1">A / D 或 左右方向鍵</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="font-bold text-slate-100">跳躍 / 浮空飛行：</span>
                <span className="text-amber-300 font-mono ml-1">W / 上鍵 / 空白鍵</span>
                <div className="text-[11px] text-slate-400 mt-0.5">空中連按可多段吸氣懸空飛行，按攻擊吐氣落下</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="font-bold text-slate-100">吸入 / 攻擊：</span>
                <span className="text-amber-300 font-mono ml-1">J 或 Z 鍵</span>
                <div className="text-[11px] text-slate-400 mt-0.5">無能力時長按形成風渦吸入小怪；口含小怪時吐出星型彈</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="font-bold text-slate-100">吞嚥吸收能力：</span>
                <span className="text-amber-300 font-mono ml-1">S 或 下方向鍵</span>
                <div className="text-[11px] text-slate-400 mt-0.5">含住具備特異能力的小怪時按吞嚥，即時複製能力</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="font-bold text-slate-100">滑鏟踢擊：</span>
                <span className="text-amber-300 font-mono ml-1">下鍵 + J/Z 鍵</span>
                <div className="text-[11px] text-slate-400 mt-0.5">高速貼地突進，能擊退怪物並鑽入狹窄低矮暗道</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="font-bold text-slate-100">丟棄當前能力：</span>
                <span className="text-amber-300 font-mono ml-1">K 或 X 鍵</span>
                <div className="text-[11px] text-slate-400 mt-0.5">彈出能力星於地面彈跳，可在消失前重新吸回</div>
              </div>
            </div>
          </div>

          {/* Section 2: Copy Abilities & Environmental Puzzles */}
          <div>
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              複製能力與環境解謎矩陣
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.values(ABILITIES).map((ab) => (
                <div key={ab.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{ab.icon}</span>
                    <span className="font-bold text-slate-200 text-xs">{ab.name}</span>
                  </div>
                  <div className="text-xs text-slate-300">{ab.description}</div>
                  <div className="text-[11px] text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 rounded px-2 py-1 mt-1">
                    <span className="font-semibold">環境機關：</span> {ab.puzzleUse}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: The Phone & Companions Co-op */}
          <div>
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Phone className="w-4 h-4" />
              星晶通訊器與 3 位分身隊友
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2 text-xs">
              <div>
                持有最高 3 格電量（🔋🔋🔋）。按 <span className="font-bold text-amber-300 font-mono">[C 鍵]</span> 撥通手機呼叫：
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li><span className="text-amber-400 font-semibold">烈焰光靈（黃）</span>：擅長火焰衝擊與近戰。</li>
                <li><span className="text-emerald-400 font-semibold">飛刃光靈（綠）</span>：擅長遠程迴旋斬斷繩。</li>
                <li><span className="text-cyan-400 font-semibold">巨槌光靈（藍）</span>：擅長重鎚砸擊地樁。</li>
                <li><span className="text-pink-300 font-semibold">四人協力推石</span>：巨石需 4 位光靈共同發力推開！</li>
                <li><span className="text-pink-300 font-semibold">四位一體壓板</span>：召喚隊友一同站上 4 處壓力板解除神廟封印！</li>
                <li><span className="text-pink-300 font-semibold">口對口親吻分享食物</span>：拾取 M番茄或蘋果後與隊友接觸，即可互相補給體力！</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 text-xs font-medium transition-colors"
          >
            我明白了
          </button>
        </div>
      </div>
    </div>
  );
};
