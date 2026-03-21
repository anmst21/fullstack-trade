'use client';

import { useRef } from 'react';
import { useCoin } from '@/context/coin';
import { ChevDown, ChartIcon } from '@/components/icons';
import { useLastPrice } from '@/hooks/use-last-price';

function fmtPrice(n: number) {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: n < 1 ? 6 : 2,
  });
}

export default function TokenHeader() {
  const { coin, meta } = useCoin();
  const { lastPrice, direction } = useLastPrice(coin);

  const lastColorRef = useRef('#fafafa');
  const lastDirectionRef = useRef<'up' | 'down'>('up');
  if (direction === 'up') { lastColorRef.current = '#A1FF00'; lastDirectionRef.current = 'up'; }
  else if (direction === 'down') { lastColorRef.current = '#FF3100'; lastDirectionRef.current = 'down'; }
  const color = lastColorRef.current;
  const iconFlip = lastDirectionRef.current === 'down';

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <button className="flex items-center gap-3 border border-white/10 rounded-lg px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer">
        <img
          src={`https://app.hyperliquid.xyz/coins/${coin}.svg`}
          alt={coin}
          width={30}
          height={30}
          className="rounded-full border border-white/10 bg-white"
        />
        <div className="flex flex-col items-start">
          <span className="text-[16px] leading-tight font-bold text-[#fafafa]">
            {coin}<span className="text-[#a7a7b7] font-normal">/USDC</span>
          </span>
          <span className="text-[12px] leading-tight text-[#a7a7b7]">Perpetuals</span>
        </div>
        <span style={{ transform: 'rotate(-90deg)' }}>
          <ChevDown />
        </span>
      </button>

      <div className="flex items-center gap-3">
        {lastPrice !== undefined && (
          <div className="flex items-center gap-1.5" style={{ color }}>
            <span className="text-[20px] font-bold">${fmtPrice(lastPrice)}</span>
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
        )}

        {meta && (
          <span className="border border-white/10 rounded-lg px-3 py-1 text-[#fafafa] font-bold text-sm">
            {meta.maxLeverage}×
          </span>
        )}
      </div>
    </div>
  );
}
