import { memo } from "react";
import { createPortal } from "react-dom";
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
  highlighted?: boolean;
  hoverBorder?: "top" | "bottom" | false;
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
  highlighted,
  hoverBorder,
}: RowProps) {
  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  const isBid = side === "bid";
  const valClass = highlighted
    ? "text-right text-[var(--text-primary)] font-medium"
    : "text-right text-[var(--text-tertiary)]";

  return (
    <div
      className={cn(
        'relative grid grid-cols-3 text-xs sm:text-sm py-[2px] sm:py-[3px] px-3 cursor-default',
        flash && `flash-row-${side}`,
        highlighted && 'ob-row-highlighted',
        hoverBorder === 'top' && 'ob-row-border-top',
        hoverBorder === 'bottom' && 'ob-row-border-bottom',
      )}
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
        style={{ color: isBid ? "var(--color-bid)" : "var(--color-ask)" }}
        className={highlighted ? "font-medium" : undefined}
      >
        {fmt(parseFloat(px), 0)}
      </span>
      <span className={valClass}>
        {fmt(sz, szDecimals)}
      </span>
      <span className={valClass}>
        {fmt(total, szDecimals)}
      </span>
    </div>
  );
});

export interface DepthRowProps {
  px: string;
  sz: number;
  total: number;
  maxTotal: number;
  side: "bid" | "ask";
  szDecimals: number;
  flash: boolean;
  highlighted?: boolean;
  hoverBorder?: "top" | "bottom" | false;
}

export const DepthRow = memo(function DepthRow({
  px,
  sz,
  total,
  maxTotal,
  side,
  szDecimals,
  flash,
  highlighted,
  hoverBorder,
}: DepthRowProps) {
  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  const isBid = side === "bid";

  return (
    <div
      className={cn(
        'relative grid grid-cols-2 text-xs sm:text-sm py-[2px] sm:py-[3px] px-3 cursor-default',
        flash && `flash-row-${side}`,
        highlighted && 'ob-row-highlighted',
        hoverBorder === 'top' && 'ob-row-border-top',
        hoverBorder === 'bottom' && 'ob-row-border-bottom',
      )}
    >
      <span
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{
          [isBid ? "right" : "left"]: 0,
          width: `${pct}%`,
          background: isBid
            ? "var(--color-bid-bar)"
            : "var(--color-ask-bar)",
          transition: "width 200ms ease-out",
        }}
      />
      {isBid ? (
        <>
          <span
            className={highlighted
              ? "text-[var(--text-primary)] font-medium"
              : "text-[var(--text-tertiary)]"
            }
          >
            {fmt(sz, szDecimals)}
          </span>
          <span
            style={{ color: "var(--color-bid)" }}
            className={cn("text-right", highlighted && "font-medium")}
          >
            {fmt(parseFloat(px), 0)}
          </span>
        </>
      ) : (
        <>
          <span
            style={{ color: "var(--color-ask)" }}
            className={highlighted ? "font-medium" : undefined}
          >
            {fmt(parseFloat(px), 0)}
          </span>
          <span
            className={highlighted
              ? "text-right text-[var(--text-primary)] font-medium"
              : "text-right text-[var(--text-tertiary)]"
            }
          >
            {fmt(sz, szDecimals)}
          </span>
        </>
      )}
    </div>
  );
});

export function AggTooltip({ avgPx, sumSz, sumTotal, szDecimals, side, anchorEl, anchor = "right", borderEdge }: {
  avgPx: number; sumSz: number; sumTotal: number; szDecimals: number; side: "bid" | "ask";
  anchorEl: HTMLDivElement | null;
  anchor?: "left" | "right";
  borderEdge?: "top" | "bottom";
}) {
  if (!anchorEl) return null;

  const rect = anchorEl.getBoundingClientRect();
  const edge = borderEdge ?? (side === "ask" ? "top" : "bottom");
  const top = edge === "top" ? rect.top : rect.bottom;
  const isRight = anchor === "right";

  const posStyle: React.CSSProperties = {
    top,
    transform: "translateY(-50%)",
    ...(isRight ? { left: rect.right + 12 } : { right: window.innerWidth - rect.left + 12 }),
  };

  return createPortal(
    <div className="fixed z-[60] pointer-events-none" style={posStyle}>
      {/* Arrow border layer */}
      <div className={cn(
        "absolute top-1/2 -translate-y-1/2 w-[10px] h-[10px] rotate-45 bg-[var(--color-surface-modal)] z-[1]",
        isRight ? "-left-[6px] border-l border-b border-white/10" : "-right-[6px] border-r border-t border-white/10",
      )} />
      {/* Arrow cover — hides the card border at the junction */}
      <div className={cn(
        "absolute top-1/2 -translate-y-1/2 w-[2px] h-[10px] bg-[var(--color-surface-modal)] z-[3]",
        isRight ? "-left-px" : "-right-px",
      )} />
      <div className="relative z-[2] bg-[var(--color-surface-modal)] border border-white/10 rounded-lg shadow-xl px-3 py-2 text-xs whitespace-nowrap">
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5">
          <span className="text-[var(--text-secondary)]">Avg.Price:</span>
          <span className="text-right font-medium" style={{ color: side === "bid" ? "var(--color-bid)" : "var(--color-ask)" }}>
            ≈ {fmt(avgPx, 2)}
          </span>
          <span className="text-[var(--text-secondary)]">Sum Size:</span>
          <span className="text-right font-medium">{fmt(sumSz, szDecimals)}</span>
          <span className="text-[var(--text-secondary)]">Sum Total:</span>
          <span className="text-right font-medium">{fmt(sumTotal, szDecimals)}</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function SpreadBar({ spread, spreadDecimals, spreadPct }: { spread: number; spreadDecimals: number; spreadPct: string }) {
  return (
    <div className="grid grid-cols-3 text-xs sm:text-sm text-[var(--text-secondary)] px-3 py-[3px] sm:py-[5px] bg-white/[0.03] cursor-default">
      <span>Spread</span>
      <span className="text-center">
        {spread > 0 ? fmt(spread, spreadDecimals) : "—"}
      </span>
      <span className="text-right">{spreadPct}%</span>
    </div>
  );
}
