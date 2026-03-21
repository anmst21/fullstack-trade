import { memo } from "react";
import cn from "classnames";
import { fmt } from "@/helpers/formatters";
import type { Level } from "@/hooks/use-hyperliquid";

export interface LayoutProps {
  topAsks: Level[];
  topBids: Level[];
  askDisplaySizes: number[];
  bidDisplaySizes: number[];
  askTotals: number[];
  bidTotals: number[];
  maxTotal: number;
  szDecimals: number;
  flashedPrices: Set<string>;
  spread: number;
  spreadDecimals: number;
  spreadPct: string;
  asset: string;
}

export interface RowProps {
  px: string;
  sz: number;
  total: number;
  maxTotal: number;
  side: "bid" | "ask";
  szDecimals: number;
  flash: boolean;
  barAlign?: "left" | "right";
}

export const Row = memo(function Row({
  px,
  sz,
  total,
  maxTotal,
  side,
  szDecimals,
  flash,
  barAlign = "left",
}: RowProps) {
  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  const isBid = side === "bid";

  return (
    <div
      className={cn('relative grid grid-cols-3 text-sm py-[3px] px-3 cursor-default', flash && `flash-row-${side}`)}
    >
      <span
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{
          [barAlign]: 0,
          width: `${pct}%`,
          background: isBid ? "var(--color-bid-bar)" : "var(--color-ask-bar)",
          transition: "width 200ms ease-out",
        }}
      />
      <span
        className="hover:font-semibold"
        style={{ color: isBid ? "var(--color-bid)" : "var(--color-ask)" }}
      >
        {fmt(parseFloat(px), 0)}
      </span>
      <span className="text-right text-[var(--text-tertiary)] hover:font-semibold">
        {fmt(sz, szDecimals)}
      </span>
      <span className="text-right text-[var(--text-tertiary)] hover:font-semibold">
        {fmt(total, szDecimals)}
      </span>
    </div>
  );
});

export const DepthRow = memo(function DepthRow({
  px,
  sz,
  maxTotal,
  side,
  szDecimals,
  flash,
}: Omit<RowProps, "total" | "barAlign">) {
  const pct = maxTotal > 0 ? (sz / maxTotal) * 100 : 0;
  const isBid = side === "bid";

  return (
    <div
      className={cn('relative grid grid-cols-2 text-sm py-[3px] px-2 cursor-default', flash && `flash-row-${side}`)}
    >
      <span
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{
          [isBid ? "left" : "right"]: 0,
          width: `${pct}%`,
          background: isBid ? "var(--color-bid-bar)" : "var(--color-ask-bar)",
          transition: "width 200ms ease-out",
        }}
      />
      <span
        className="hover:font-semibold"
        style={{ color: isBid ? "var(--color-bid)" : "var(--color-ask)" }}
      >
        {fmt(parseFloat(px), 0)}
      </span>
      <span
        className="text-right text-[var(--text-tertiary)] hover:font-semibold"
      >
        {fmt(sz, szDecimals)}
      </span>
    </div>
  );
});

export function SpreadBar({ spread, spreadDecimals, spreadPct }: { spread: number; spreadDecimals: number; spreadPct: string }) {
  return (
    <div className="grid grid-cols-3 text-sm text-[var(--text-secondary)] px-3 py-[5px] bg-white/[0.03] cursor-default">
      <span>Spread</span>
      <span className="text-center">
        {spread > 0 ? fmt(spread, spreadDecimals) : "—"}
      </span>
      <span className="text-right">{spreadPct}%</span>
    </div>
  );
}
