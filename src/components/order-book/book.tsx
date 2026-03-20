'use client';

import { useRef, useState } from 'react';
import type { Book as BookData, Level } from '@/hooks/use-hyperliquid';
import { ChevDown } from '@/components/icons/chev-down';

const ROW_COUNT = 11;
const GROUP_OPTIONS = [1, 2, 5, 10, 100, 1000];
const ASSET_OPTIONS = ['USDC', 'BTC'];

function fmt(n: number, decimals = 2) {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtGroup(n: number) {
  return n.toLocaleString('en-US');
}

function applyGrouping(levels: Level[], group: number, side: 'bid' | 'ask'): Level[] {
  if (group === 1) return levels;
  const buckets = new Map<number, number>();
  for (const level of levels) {
    const price = parseFloat(level.px);
    const size = parseFloat(level.sz);
    const bucket = side === 'bid'
      ? Math.floor(price / group) * group
      : Math.ceil(price / group) * group;
    buckets.set(bucket, (buckets.get(bucket) || 0) + size);
  }
  return Array.from(buckets.entries())
    .map(([px, sz]) => ({ px: String(px), sz: String(sz), n: 1 }));
}

interface RowProps {
  px: string;
  sz: number;
  total: number;
  maxTotal: number;
  side: 'bid' | 'ask';
  szDecimals: number;
}

function Row({ px, sz, total, maxTotal, side, szDecimals }: RowProps) {
  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  const isBid = side === 'bid';

  return (
    <div className="relative grid grid-cols-3 text-sm font-mono py-[3px] px-3 hover:bg-white/5 cursor-default">
      <span
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{
          [isBid ? 'left' : 'right']: 0,
          width: `${pct}%`,
          background: isBid ? 'rgba(161,255,0,0.08)' : 'rgba(255,49,0,0.08)',
        }}
      />
      <span style={{ color: isBid ? '#A1FF00' : '#FF3100' }}>{fmt(parseFloat(px), 0)}</span>
      <span className="text-right text-[#c8c8d0]">{fmt(sz, szDecimals)}</span>
      <span className="text-right text-[#c8c8d0]">{fmt(total, szDecimals)}</span>
    </div>
  );
}

export default function Book({ bids, asks }: BookData) {
  const [group, setGroup] = useState(1);
  const [open, setOpen] = useState(false);
  const [asset, setAsset] = useState('BTC');
  const [assetOpen, setAssetOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isUSDC = asset === 'USDC';
  const szDecimals = isUSDC ? 2 : 5;

  // Apply grouping
  const groupedAsks = applyGrouping(asks, group, 'ask');
  const groupedBids = applyGrouping(bids, group, 'bid');

  // Sort and slice
  const topAsks = [...groupedAsks].sort((a, b) => parseFloat(b.px) - parseFloat(a.px)).slice(0, ROW_COUNT);
  const topBids = [...groupedBids].sort((a, b) => parseFloat(b.px) - parseFloat(a.px)).slice(0, ROW_COUNT);

  // Convert size to USDC if needed
  function toDisplaySz(sz: string, px: string) {
    const s = parseFloat(sz);
    return isUSDC ? s * parseFloat(px) : s;
  }

  // Cumulative totals — asks cumulate from best ask upward
  const askDisplaySizes = topAsks.map((l) => toDisplaySz(l.sz, l.px));
  const askTotals: number[] = new Array(topAsks.length).fill(0);
  let askCum = 0;
  for (let i = topAsks.length - 1; i >= 0; i--) {
    askCum += askDisplaySizes[i];
    askTotals[i] = askCum;
  }

  const bidDisplaySizes = topBids.map((l) => toDisplaySz(l.sz, l.px));
  const bidTotals: number[] = [];
  let bidCum = 0;
  for (let i = 0; i < topBids.length; i++) {
    bidCum += bidDisplaySizes[i];
    bidTotals[i] = bidCum;
  }

  const maxTotal = Math.max(askCum, bidCum) || 1;

  const lowestAsk = topAsks[topAsks.length - 1] ? parseFloat(topAsks[topAsks.length - 1].px) : 0;
  const highestBid = topBids[0] ? parseFloat(topBids[0].px) : 0;
  const spread = lowestAsk - highestBid;
  const spreadPct = lowestAsk > 0 ? ((spread / lowestAsk) * 100).toFixed(3) : '0.000';

  return (
    <div className="flex flex-col">
      {/* filter row */}
      <div className="flex items-center justify-between px-3 py-2 text-sm text-[#a7a7b7]">

        {/* grouping dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-3 hover:text-[#fafafa] transition-colors"
          >
            {fmtGroup(group)}
            <span style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-flex' }}>
              <ChevDown />
            </span>
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute left-0 top-full mt-1 z-20 min-w-[80px] rounded-lg bg-[#1c1c21] border border-white/10 shadow-xl overflow-hidden">
                {GROUP_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setGroup(opt); setOpen(false); }}
                    className={[
                      'w-full text-left px-4 py-[7px] text-sm font-mono transition-colors',
                      opt === group ? 'text-[#fafafa]' : 'text-[#a7a7b7] hover:text-[#fafafa] hover:bg-white/5',
                    ].join(' ')}
                  >
                    {fmtGroup(opt)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* asset dropdown */}
        <div className="relative">
          <button
            onClick={() => setAssetOpen((v) => !v)}
            className="flex items-center gap-3 hover:text-[#fafafa] transition-colors"
          >
            {asset}
            <span style={{ transition: 'transform 0.2s', transform: assetOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-flex' }}>
              <ChevDown />
            </span>
          </button>

          {assetOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setAssetOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 min-w-[80px] rounded-lg bg-[#1c1c21] border border-white/10 shadow-xl overflow-hidden">
                {ASSET_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setAsset(opt); setAssetOpen(false); }}
                    className={[
                      'w-full text-left px-4 py-[7px] text-sm font-mono transition-colors',
                      opt === asset ? 'text-[#fafafa]' : 'text-[#a7a7b7] hover:text-[#fafafa] hover:bg-white/5',
                    ].join(' ')}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* column headers */}
      <div className="grid grid-cols-3 text-sm text-[#a7a7b7] px-3 pb-1">
        <span>Price</span>
        <span className="text-right">Size ({asset})</span>
        <span className="text-right">Total ({asset})</span>
      </div>

      {/* asks */}
      {topAsks.map((level, i) => (
        <Row
          key={level.px}
          px={level.px}
          sz={askDisplaySizes[i]}
          total={askTotals[i]}
          maxTotal={maxTotal}
          side="ask"
          szDecimals={szDecimals}
        />
      ))}

      {/* spread */}
      <div className="grid grid-cols-3 text-sm text-[#a7a7b7] px-3 py-[5px] bg-white/[0.03]">
        <span>Spread</span>
        <span className="text-center">{spread > 0 ? fmt(spread, 0) : '—'}</span>
        <span className="text-right">{spreadPct}%</span>
      </div>

      {/* bids */}
      {topBids.map((level, i) => (
        <Row
          key={level.px}
          px={level.px}
          sz={bidDisplaySizes[i]}
          total={bidTotals[i]}
          maxTotal={maxTotal}
          side="bid"
          szDecimals={szDecimals}
        />
      ))}
    </div>
  );
}
