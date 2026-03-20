import type { Trade } from "@/hooks/use-hyperliquid";
import { Link } from "@/components/icons/link";

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
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

interface TradesProps {
  trades: Trade[];
  coin: string;
}

export default function Trades({ trades, coin }: TradesProps) {
  return (
    <div className="flex flex-col">
      {/* column headers */}
      <div className="grid grid-cols-3 text-sm text-[#a7a7b7] px-3 py-2">
        <span>Price</span>
        <span className="text-right">Size ({coin})</span>
        <span className="text-right">Time</span>
      </div>

      {/* rows */}
      {trades.map((trade, i) => {
        const isBuy = trade.side === "B";
        return (
          <div
            key={`${trade.hash}-${i}`}
            className="grid grid-cols-3 items-center text-sm font-mono py-[3px] px-3 hover:bg-white/5 cursor-default"
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
      })}

      {trades.length === 0 && (
        <div className="py-8 text-center text-sm text-[#a7a7b7]">
          Connecting…
        </div>
      )}
    </div>
  );
}
