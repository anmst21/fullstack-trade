import type { LayoutMode } from '@/context/order-book-layout';

const DURATION = 1600; // ms, must match CSS animation duration
const TOTAL_ROWS = 23;
const TRADES_ROWS = 24;
const DEPTH_ROWS = 25;

export function TradesSkeleton({ coin: _coin }: { coin: string }) {
  return (
    <div className="flex flex-col">
      {Array.from({ length: TRADES_ROWS }, (_, i) => (
        <div
          key={i}
          className="shimmer"
          style={{
            height: 26,
            animationDelay: `-${(i / (TRADES_ROWS - 1)) * DURATION}ms`,
          }}
        />
      ))}
    </div>
  );
}

interface BookSkeletonProps {
  asset: string;
  coin: string;
  layout?: LayoutMode;
}

export default function BookSkeleton({ asset, coin, layout = 'order-book' }: BookSkeletonProps) {
  if (layout === 'depth-view') {
    return (
      <div className="flex flex-col">
        <div className="grid grid-cols-2 text-sm text-[#a7a7b7] py-2 border-b border-white/5">
          <div className="grid grid-cols-2 px-2">
            <span>Price</span>
            <span className="text-right">Size</span>
          </div>
          <div className="grid grid-cols-2 px-2 border-l border-white/5">
            <span>Price</span>
            <span className="text-left pl-1">Size</span>
          </div>
        </div>
        <div className="grid grid-cols-2">
          <div className="flex flex-col border-r border-white/5">
            {Array.from({ length: DEPTH_ROWS }, (_, i) => (
              <div
                key={i}
                className="shimmer"
                style={{
                  height: 26,
                  animationDelay: `-${(i / (DEPTH_ROWS - 1)) * DURATION}ms`,
                }}
              />
            ))}
          </div>
          <div className="flex flex-col">
            {Array.from({ length: DEPTH_ROWS }, (_, i) => (
              <div
                key={i}
                className="shimmer"
                style={{
                  height: 26,
                  animationDelay: `-${(i / (DEPTH_ROWS - 1)) * DURATION}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const singleSide = layout === 'buy-order' || layout === 'sell-order';
  const rowCount = singleSide ? DEPTH_ROWS : 11;

  const rows: { height: number; rowIndex: number }[] = singleSide
    ? Array.from({ length: rowCount }, (_, i) => ({ height: 26, rowIndex: i }))
    : [
        ...Array.from({ length: 11 }, (_, i) => ({ height: 26, rowIndex: i })),
        { height: 30, rowIndex: 11 },
        ...Array.from({ length: 11 }, (_, i) => ({ height: 26, rowIndex: i + 12 })),
      ];

  const totalRows = singleSide ? rowCount : TOTAL_ROWS;

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-3 text-sm text-[#a7a7b7] px-3 py-2">
        <span>Price</span>
        <span className="text-right">Size ({asset})</span>
        <span className="text-right">Total ({asset === 'USDC' ? 'USDC' : coin})</span>
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
    </div>
  );
}
