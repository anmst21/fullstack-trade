import type { LayoutMode } from '@/context/order-book-layout';
import { ROW_COUNT, DEPTH_ROW_COUNT } from '@/helpers/constants';

const DURATION = 1600; // ms, must match CSS animation duration
const TOTAL_ROWS = ROW_COUNT * 2 + 1; // asks + spread + bids
const TRADES_ROWS = 28;
const ROW_H = 'var(--row-h)';

const SPREAD_H = 'var(--spread-h)';

function SpreadSkeleton({ index, total }: { index: number; total: number }) {
  return (
    <div
      className="shimmer"
      style={{
        height: SPREAD_H,
        animationDelay: `-${(index / (total - 1)) * DURATION}ms`,
      }}
    />
  );
}

export function TradesSkeleton({ coin: _coin }: { coin: string }) {
  return (
    <div className="flex flex-col">
      {Array.from({ length: TRADES_ROWS }, (_, i) => (
        <div
          key={i}
          className="shimmer"
          style={{
            height: ROW_H,
            animationDelay: `-${(i / (TRADES_ROWS - 1)) * DURATION}ms`,
          }}
        />
      ))}
    </div>
  );
}

interface BookSkeletonProps {
  layout?: LayoutMode;
}

export default function BookSkeleton({ layout = 'order-book' }: BookSkeletonProps) {
  if (layout === 'depth-view') {
    return (
      <div className="flex flex-col">
        <div className="grid grid-cols-2">
          <div className="flex flex-col border-r border-white/5">
            {Array.from({ length: DEPTH_ROW_COUNT }, (_, i) => (
              <div
                key={i}
                className="shimmer"
                style={{
                  height: ROW_H,
                  animationDelay: `-${(i / (DEPTH_ROW_COUNT - 1)) * DURATION}ms`,
                }}
              />
            ))}
          </div>
          <div className="flex flex-col">
            {Array.from({ length: DEPTH_ROW_COUNT }, (_, i) => (
              <div
                key={i}
                className="shimmer"
                style={{
                  height: ROW_H,
                  animationDelay: `-${(i / (DEPTH_ROW_COUNT - 1)) * DURATION}ms`,
                }}
              />
            ))}
          </div>
        </div>
        <SpreadSkeleton index={DEPTH_ROW_COUNT} total={DEPTH_ROW_COUNT + 1} />
      </div>
    );
  }

  const singleSide = layout === 'buy-order' || layout === 'sell-order';

  const rowCount = singleSide ? DEPTH_ROW_COUNT : ROW_COUNT;
  const totalRows = singleSide ? DEPTH_ROW_COUNT : TOTAL_ROWS;

  const rows: { height: string | number; rowIndex: number }[] = singleSide
    ? Array.from({ length: rowCount }, (_, i) => ({ height: ROW_H, rowIndex: i }))
    : [
        ...Array.from({ length: ROW_COUNT }, (_, i) => ({ height: ROW_H, rowIndex: i })),
        { height: SPREAD_H, rowIndex: 11 },
        ...Array.from({ length: ROW_COUNT }, (_, i) => ({ height: ROW_H, rowIndex: i + 12 })),
      ];

  return (
    <div className="flex flex-col">
      {rows.map(({ height, rowIndex }) => (
        <div
          key={rowIndex}
          className="shimmer"
          style={{
            height,
            animationDelay: `-${(rowIndex / (totalRows - 1)) * DURATION}ms`,
          }}
        />
      ))}

      {singleSide && <SpreadSkeleton index={DEPTH_ROW_COUNT} total={DEPTH_ROW_COUNT + 1} />}
    </div>
  );
}
