'use client';

import { useState } from 'react';
import { ChevDown } from '@/components/icons/chev-down';

function fmtGroup(n: number): string {
  if (n < 1) return n.toString();
  return n.toLocaleString('en-US');
}

interface BottomBarProps {
  coin: string;
  asset: string;
  onAssetChange: (asset: string) => void;
  groupIdx: number;
  groupOptions: number[];
  onGroupIdxChange: (idx: number) => void;
}

export default function BottomBar({ coin, asset, onAssetChange, groupIdx, groupOptions, onGroupIdxChange }: BottomBarProps) {
  const [sigOpen, setSigOpen] = useState(false);

  return (
    <div className="flex items-center justify-between px-3 py-2 text-sm text-[#a7a7b7] border-t border-white/5">

      {/* grouping dropdown — opens upward */}
      <div className="relative">
        <button
          onClick={() => setSigOpen((v) => !v)}
          className="flex items-center gap-3 hover:text-[#fafafa] transition-colors font-mono"
        >
          {fmtGroup(groupOptions[groupIdx])}
          <span style={{ transition: 'transform 0.2s', transform: sigOpen ? 'rotate(0deg)' : 'rotate(180deg)', display: 'inline-flex' }}>
            <ChevDown />
          </span>
        </button>

        {sigOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setSigOpen(false)} />
            <div className="absolute left-0 bottom-full mb-1 z-20 min-w-[80px] rounded-lg bg-[#1c1c21] border border-white/10 shadow-xl overflow-hidden">
              {groupOptions.map((opt, i) => (
                <button
                  key={opt}
                  onClick={() => { onGroupIdxChange(i); setSigOpen(false); }}
                  className={[
                    'w-full text-left px-4 py-[7px] text-sm font-mono transition-colors',
                    i === groupIdx ? 'text-[#fafafa]' : 'text-[#a7a7b7] hover:text-[#fafafa] hover:bg-white/5',
                  ].join(' ')}
                >
                  {fmtGroup(opt)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* size unit toggle */}
      <div className="flex items-center gap-2 font-mono">
        <button
          onClick={() => onAssetChange('USDC')}
          className={`transition-colors ${asset === 'USDC' ? 'text-[#fafafa] font-medium' : 'hover:text-[#fafafa]'}`}
        >
          USDC
        </button>
        <button
          onClick={() => onAssetChange(coin)}
          className={`transition-colors ${asset === coin ? 'text-[#fafafa] font-medium' : 'hover:text-[#fafafa]'}`}
        >
          {coin}
        </button>
      </div>
    </div>
  );
}
