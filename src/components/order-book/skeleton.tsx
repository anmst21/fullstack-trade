import type { LayoutMode } from '@/context/order-book-layout';
import { ROW_COUNT, DEPTH_ROW_COUNT, ROW_HEIGHT_PX } from '@/helpers/constants';

const DURATION = 1600; // ms, must match CSS animation duration
const TOTAL_ROWS = ROW_COUNT * 2 + 1; // asks + spread + bids
const TRADES_ROWS = 24;

function SpreadSkeleton({ index, total }: { index: number; total: number }) {
  return (
    <div
      className="shimmer"
      style={{
        height: 30,
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
            height: ROW_HEIGHT_PX,
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
        <div className="grid grid-cols-2 text-sm text-[var(--text-secondary)] py-2 border-b border-white/5">
          <div className="grid grid-cols-2 px-2">
            <span>Price</span>
            <span className="text-right">Size</span>
          </div>
          <div className="grid grid-cols-2 px-2 border-l border-white/5">
            <span>Price</span>
            <span className="text-right">Size</span>
          </div>
        </div>
        <div className="grid grid-cols-2">
          <div className="flex flex-col border-r border-white/5">
            {Array.from({ length: DEPTH_ROW_COUNT }, (_, i) => (
              <div
                key={i}
                className="shimmer"
                style={{
                  height: ROW_HEIGHT_PX,
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
                  height: ROW_HEIGHT_PX,
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

  const rows: { height: number; rowIndex: number }[] = singleSide
    ? Array.from({ length: DEPTH_ROW_COUNT }, (_, i) => ({ height: ROW_HEIGHT_PX, rowIndex: i }))
    : [
        ...Array.from({ length: ROW_COUNT }, (_, i) => ({ height: ROW_HEIGHT_PX, rowIndex: i })),
        { height: 30, rowIndex: 11 },
        ...Array.from({ length: ROW_COUNT }, (_, i) => ({ height: ROW_HEIGHT_PX, rowIndex: i + 12 })),
      ];

  const totalRows = singleSide ? DEPTH_ROW_COUNT : TOTAL_ROWS;

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-3 text-sm text-[var(--text-secondary)] px-3 py-2">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

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
