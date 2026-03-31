import type { Trade } from "@/hooks/use-hyperliquid";
import { Link } from "@/components/icons/link";
import { TradesSkeleton } from "./skeleton";
import type { TradesLayoutMode } from "@/context/trades-layout";
import cn from "classnames";
import { fmt, formatTime } from "@/helpers/formatters";
import { explorerTxUrl } from "@/helpers/urls";

interface TradesProps {
  trades: Trade[];
  coin: string;
  layout?: TradesLayoutMode;
}

function TradeRow({ trade }: { trade: Trade }) {
  const isBuy = trade.side === "B";
  console.log({ trade });

  const sizeUsdUnformatted = parseFloat(trade.px) * parseFloat(trade.sz);

  const sizeUsd = fmt(sizeUsdUnformatted, 2);

  const tradeMode = (sizeUsd: number) => {
    const MIN = 100;
    const MAX = 10000;
    const MIN_H = 26;
    const MAX_H = 70;

    const t = Math.min(Math.max((sizeUsd - MIN) / (MAX - MIN), 0), 1);
    const height = Math.round(MIN_H + t * (MAX_H - MIN_H));
    const alpha = +(0.1 + t * 0.4).toFixed(2);

    let emoji = "";
    if (sizeUsd >= 10000) emoji = "🐋";
    else if (sizeUsd >= 1000) emoji = "🐬";
    else if (sizeUsd >= 100) emoji = "🐟";

    return { emoji, height, alpha };
  };

  const { emoji, height, alpha } = tradeMode(sizeUsdUnformatted);
  const bg = isBuy
    ? `rgba(161, 255, 0, ${alpha})`
    : `rgba(255, 49, 0, ${alpha})`;

  return (
    <div
      className="grid grid-cols-3 items-center text-xs sm:text-sm px-3 cursor-default"
      style={{ height, backgroundColor: bg }}
      onClick={() =>
        window.open(explorerTxUrl(trade.hash), "_blank", "noopener,noreferrer")
      }
    >
      <span style={{ color: isBuy ? "var(--color-bid)" : "var(--color-ask)" }}>
        {fmt(trade.px, 0)}
        <span className="ml-4">{emoji}</span>
      </span>

      <span className="text-right text-[var(--text-tertiary)]">{sizeUsd}</span>
      <span className="flex items-center justify-end gap-1 text-[var(--text-secondary)]">
        {formatTime(trade.time)}
        <a
          href={explorerTxUrl(trade.hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Link />
        </a>
      </span>
    </div>
  );
}

export default function Trades({
  trades,
  coin,
  layout = "trades",
}: TradesProps) {
  const isEmpty = trades.length === 0;

  // ── Depth View — buys left, sells right ───────────────────────────────────
  if (layout === "depth-view") {
    const buys = trades.filter((t) => t.side === "B");
    const sells = trades.filter((t) => t.side === "A");
    return (
      <div
        className={cn(
          "relative grid grid-cols-2 grid-rows-[auto_1fr] min-h-full",
          "after:absolute after:left-1/2 after:top-0 after:bottom-0 after:w-px after:bg-white/10 after:z-10",
        )}
      >
        <div className="grid grid-cols-2 text-xs sm:text-sm text-[var(--text-secondary)] py-1 sm:py-2 px-3 border-b border-white/10">
          <span>Size</span>
          <span className="text-right">Price</span>
        </div>
        <div className="grid grid-cols-2 text-xs sm:text-sm text-[var(--text-secondary)] py-1 sm:py-2 px-3 border-b border-white/10">
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
                  className="grid grid-cols-2 text-xs sm:text-sm py-[2px] sm:py-[3px] px-3 hover:bg-white/5 cursor-default"
                  onClick={() =>
                    window.open(
                      explorerTxUrl(trade.hash),
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                >
                  <span className="text-[var(--text-tertiary)]">
                    {fmt(parseFloat(trade.px) * parseFloat(trade.sz), 2)}
                  </span>
                  <span
                    className="text-right"
                    style={{ color: "var(--color-bid)" }}
                  >
                    {fmt(trade.px, 0)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              {sells.map((trade, i) => (
                <div
                  key={`${trade.hash}-${i}`}
                  className="grid grid-cols-2 text-xs sm:text-sm py-[2px] sm:py-[3px] px-3 hover:bg-white/5 cursor-default"
                  onClick={() =>
                    window.open(
                      explorerTxUrl(trade.hash),
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                >
                  <span style={{ color: "var(--color-ask)" }}>
                    {fmt(trade.px, 0)}
                  </span>
                  <span className="text-right text-[var(--text-tertiary)]">
                    {fmt(parseFloat(trade.px) * parseFloat(trade.sz), 2)}
                  </span>
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
    layout === "buy-trades"
      ? trades.filter((t) => t.side === "B")
      : layout === "sell-trades"
        ? trades.filter((t) => t.side === "A")
        : trades;

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-3 text-xs sm:text-sm text-[var(--text-secondary)] px-3 py-1 sm:py-2">
        <span>Price</span>
        <span className="text-right">Size{"(USD)"}</span>
        <span className="text-right">Time</span>
      </div>

      {isEmpty ? (
        <TradesSkeleton coin={coin} />
      ) : (
        filtered.map((trade, i) => (
          <TradeRow key={`${trade.hash}-${i}`} trade={trade} />
        ))
      )}
    </div>
  );
}
