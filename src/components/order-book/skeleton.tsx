const DURATION = 1600; // ms, must match CSS animation duration
const TOTAL_ROWS = 23;
const TRADES_ROWS = 24;

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
}

export default function BookSkeleton({ asset, coin }: BookSkeletonProps) {
  const rows: { height: number; rowIndex: number }[] = [
    ...Array.from({ length: 11 }, (_, i) => ({ height: 26, rowIndex: i })),
    { height: 30, rowIndex: 11 },
    ...Array.from({ length: 11 }, (_, i) => ({ height: 26, rowIndex: i + 12 })),
  ];

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
            animationDelay: `-${(rowIndex / (TOTAL_ROWS - 1)) * DURATION}ms`,
          }}
        />
      ))}
    </div>
  );
}
