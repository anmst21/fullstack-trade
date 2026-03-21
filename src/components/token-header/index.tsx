'use client';

import { useRef, useState } from 'react';
import { useCoin } from '@/context/coin';
import { ChevDown, ChartIcon } from '@/components/icons';
import { useLastPrice } from '@/hooks/use-last-price';
import { fmtPrice } from '@/helpers/formatters';
import CoinModal from './coin-modal';
import cn from 'classnames';
import { coinIconUrl } from '@/helpers/urls';

export default function TokenHeader() {
  const { coin, meta } = useCoin();
  const { lastPrice, direction } = useLastPrice(coin);
  const [modalOpen, setModalOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const lastColorRef = useRef('var(--color-bid)');
  const lastDirectionRef = useRef<'up' | 'down'>('up');
  if (direction === 'up') { lastColorRef.current = 'var(--color-bid)'; lastDirectionRef.current = 'up'; }
  else if (direction === 'down') { lastColorRef.current = 'var(--color-ask)'; lastDirectionRef.current = 'down'; }
  const color = lastColorRef.current;
  const iconFlip = lastDirectionRef.current === 'down';

  return (
    <div className="flex items-center justify-between px-4 py-2 sm:py-3">
      <button
        ref={buttonRef}
        onClick={() => setModalOpen((v) => !v)}
        className={cn(
          'token-btn flex items-center gap-3 border border-white/10 rounded-lg px-3 py-2 transition-colors cursor-pointer',
          modalOpen ? 'active bg-white/5' : 'hover:bg-white/5',
        )}
      >
        <img
          src={coinIconUrl(coin)}
          alt={coin}
          className={cn('rounded-full border w-6 h-6 sm:w-[30px] sm:h-[30px]', coin === 'HYPE' ? 'border-white bg-black' : 'border-white/10 bg-white')}
        />
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-1.5 leading-tight">
            <span className="text-[14px] sm:text-[16px] font-bold text-[var(--text-primary)] whitespace-nowrap">{coin}<span className="text-[var(--text-secondary)] font-normal">/USDC</span></span>
            {meta ? (
              <span className="text-[8px] sm:text-[10px] font-bold rounded px-1 py-[1px]" style={{ color: 'var(--color-bid)', background: 'var(--color-bid-badge)' }}>
                {meta.maxLeverage}×
              </span>
            ) : (
              <span className="shimmer rounded w-[24.5px] h-[14.5px]" />
            )}
          </div>
          <span className="text-[10px] sm:text-[12px] leading-tight text-[var(--text-secondary)]">Perpetuals</span>
        </div>
        <span className="chev text-[var(--text-secondary)]">
          <ChevDown />
        </span>
      </button>

      <CoinModal triggerRef={buttonRef} open={modalOpen} onClose={() => setModalOpen(false)} />

      <div className="flex flex-col items-end min-h-8 sm:min-h-[38px]">
        {lastPrice !== undefined ? (
          <>
            <div className="flex items-center gap-1.5" style={{ color }}>
              <span className="text-[18px] sm:text-[20px] font-bold leading-none">${fmtPrice(lastPrice)}</span>
              <span
                style={{
                  transform: iconFlip ? 'scaleY(-1)' : 'scaleY(1)',
                  transition: 'transform 0.2s ease-out',
                  display: 'inline-flex',
                }}
              >
                <ChartIcon />
              </span>
            </div>
            {meta ? (() => {
              const vol = parseFloat(meta.dayNtlVlm);
              if (!vol) return null;
              const formatted = vol >= 1e9
                ? `$${(vol / 1e9).toFixed(2)}B`
                : vol >= 1e6
                  ? `$${(vol / 1e6).toFixed(2)}M`
                  : `$${vol.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
              return (
                <span className="text-[10px] sm:text-[12px] text-[var(--text-secondary)]">
                  Vol {formatted}
                </span>
              );
            })() : (
              <span className="shimmer rounded w-[70px] h-[14px] mt-1" />
            )}
          </>
        ) : (
          <>
            <span className="shimmer rounded-md w-[120px] h-[20px]" />
            <span className="shimmer rounded w-[70px] h-[14px] mt-1" />
          </>
        )}
      </div>
    </div>
  );
}
