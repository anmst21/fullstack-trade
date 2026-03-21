import type { Trade } from "@/hooks/use-hyperliquid";
import { Link } from "@/components/icons/link";
import { TradesSkeleton } from "./skeleton";
import type { TradesLayoutMode } from "@/context/trades-layout";
import cn from "classnames";

function formatTime(ms: number) {
  return new Date(ms).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function fmt(n: string, decimals = 5) {
  return parseFloat(n).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

interface TradesProps {
  trades: Trade[];
  coin: string;
  layout?: TradesLayoutMode;
}

function TradeRow({ trade }: { trade: Trade }) {
  const isBuy = trade.side === "B";
  return (
    <div
      className="grid grid-cols-3 items-center text-sm py-[3px] px-3 hover:bg-white/5 cursor-default"
      onClick={() => window.open(`https://app.hyperliquid.xyz/explorer/tx/${trade.hash}`, '_blank', 'noopener,noreferrer')}
    >
      <span style={{ color: isBuy ? "#A1FF00" : "#FF3100" }}>
        {fmt(trade.px, 0)}
      </span>
      <span className="text-right text-[#c8c8d0]">{fmt(trade.sz)}</span>
      <span className="flex items-center justify-end gap-1 text-[#a7a7b7]">
        {formatTime(trade.time)}
        <a
          href={`https://app.hyperliquid.xyz/explorer/tx/${trade.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#a7a7b7] hover:text-[#fafafa] transition-colors flex items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Link />
        </a>
      </span>
    </div>
  );
}

export default function Trades({ trades, coin, layout = 'trades' }: TradesProps) {
  const isEmpty = trades.length === 0;

  // ── Depth View — buys left, sells right ───────────────────────────────────
  if (layout === 'depth-view') {
    const buys = trades.filter((t) => t.side === 'B');
    const sells = trades.filter((t) => t.side === 'A');
    return (
      <div className={cn(
        "relative grid grid-cols-2",
        "after:absolute after:left-1/2 after:top-0 after:bottom-0 after:w-px after:bg-white/10 after:z-10",
      )}>
        <div className="grid grid-cols-2 text-sm text-[#a7a7b7] py-2 px-3 border-b border-white/10">
          <span>Price</span>
          <span className="text-right">Size</span>
        </div>
        <div className="grid grid-cols-2 text-sm text-[#a7a7b7] py-2 px-3 border-b border-white/10">
          <span>Price</span>
          <span className="text-right">Size</span>
        </div>
        {isEmpty ? (
          <>
            <TradesSkeleton coin={coin} />
            <TradesSkeleton coin={coin} />
          </>
        ) : (
          <>
            <div className="flex flex-col">
              {buys.map((trade, i) => (
                <div
                  key={`${trade.hash}-${i}`}
                  className="grid grid-cols-2 text-sm py-[3px] px-3 hover:bg-white/5 cursor-default"
                  onClick={() => window.open(`https://app.hyperliquid.xyz/explorer/tx/${trade.hash}`, '_blank', 'noopener,noreferrer')}
                >
                  <span style={{ color: '#A1FF00' }}>{fmt(trade.px, 0)}</span>
                  <span className="text-right text-[#c8c8d0]">{fmt(trade.sz)}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              {sells.map((trade, i) => (
                <div
                  key={`${trade.hash}-${i}`}
                  className="grid grid-cols-2 text-sm py-[3px] px-3 hover:bg-white/5 cursor-default"
                  onClick={() => window.open(`https://app.hyperliquid.xyz/explorer/tx/${trade.hash}`, '_blank', 'noopener,noreferrer')}
                >
                  <span style={{ color: '#FF3100' }}>{fmt(trade.px, 0)}</span>
                  <span className="text-right text-[#c8c8d0]">{fmt(trade.sz)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Filtered views (buy-trades / sell-trades) + default ───────────────────
  const filtered =
    layout === 'buy-trades'  ? trades.filter((t) => t.side === 'B') :
    layout === 'sell-trades' ? trades.filter((t) => t.side === 'A') :
    trades;

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-3 text-sm text-[#a7a7b7] px-3 py-2">
        <span>Price</span>
        <span className="text-right">Size ({coin})</span>
        <span className="text-right">Time</span>
      </div>

      {isEmpty
        ? <TradesSkeleton coin={coin} />
        : filtered.map((trade, i) => <TradeRow key={`${trade.hash}-${i}`} trade={trade} />)
      }
    </div>
  );
}
