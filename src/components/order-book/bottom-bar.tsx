'use client';

import { useState } from 'react';
import { ChevDown } from '@/components/icons/chev-down';
import { fmtGroup } from '@/helpers/formatters';
import cn from 'classnames';
import Tooltip from '@/components/ui/tooltip';

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
    <div className="flex items-center justify-between px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-[var(--text-secondary)] border-t border-white/5">

      {/* grouping dropdown — opens upward */}
      <div className="relative">
        <Tooltip
          content="Price grouping — merges nearby price levels into buckets of this size. Smaller values show more granular levels, larger values consolidate the book for a broader view of supply and demand."
          side="top"
          align="left"
        >
          <button
            onClick={() => setSigOpen((v) => !v)}
            className="flex items-center gap-3 hover:text-[var(--text-primary)] transition-colors font-mono cursor-pointer"
          >
            {fmtGroup(groupOptions[groupIdx])}
            <span style={{ transition: 'transform 0.2s', transform: sigOpen ? 'rotate(0deg)' : 'rotate(180deg)', display: 'inline-flex' }}>
              <ChevDown />
            </span>
          </button>
        </Tooltip>

        {sigOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setSigOpen(false)} />
            <div className="absolute left-0 bottom-full mb-1 z-20 min-w-[80px] rounded-lg bg-[var(--color-surface-modal)] border border-white/10 shadow-xl overflow-hidden">
              {groupOptions.map((opt, i) => (
                <button
                  key={opt}
                  onClick={() => { onGroupIdxChange(i); setSigOpen(false); }}
                  className={cn(
                    'w-full text-left px-4 py-[7px] text-sm font-mono transition-colors cursor-pointer',
                    i === groupIdx ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5',
                  )}
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
        <Tooltip content="Show sizes in USDC" align="right" side="top">
          <button
            onClick={() => onAssetChange('USDC')}
            className={cn('transition-colors cursor-pointer', asset === 'USDC' ? 'text-[var(--text-primary)] font-medium' : 'hover:text-[var(--text-primary)]')}
          >
            USDC
          </button>
        </Tooltip>
        <Tooltip content={`Show sizes in ${coin}`} align="right" side="top">
          <button
            onClick={() => onAssetChange(coin)}
            className={cn('transition-colors cursor-pointer', asset === coin ? 'text-[var(--text-primary)] font-medium' : 'hover:text-[var(--text-primary)]')}
          >
            {coin}
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
