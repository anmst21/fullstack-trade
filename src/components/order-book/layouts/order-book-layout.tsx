import { Row, SpreadBar } from "../book-rows";
import type { LayoutProps } from "../book-rows";
import { ROW_COUNT, ROW_HEIGHT_PX } from "@/helpers/constants";

export default function OrderBookLayout({
  topAsks,
  topBids,
  askDisplaySizes,
  bidDisplaySizes,
  askTotals,
  bidTotals,
  maxTotal,
  szDecimals,
  flashedPrices,
  spread,
  spreadDecimals,
  spreadPct,
  asset,
}: LayoutProps) {
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-3 text-sm text-[var(--text-secondary)] px-3 py-2">
        <span>Price</span>
        <span className="text-right">Size ({asset})</span>
        <span className="text-right">Total ({asset})</span>
      </div>

      <div
        className="flex flex-col justify-end"
        style={{ height: ROW_COUNT * ROW_HEIGHT_PX }}
      >
        {topAsks.map((level, i) => (
          <Row
            key={level.px}
            px={level.px}
            sz={askDisplaySizes[i]}
            total={askTotals[i]}
            maxTotal={maxTotal}
            side="ask"
            szDecimals={szDecimals}
            flash={flashedPrices.has(level.px)}
          />
        ))}
      </div>

      <SpreadBar spread={spread} spreadDecimals={spreadDecimals} spreadPct={spreadPct} />

      <div className="flex flex-col" style={{ height: ROW_COUNT * ROW_HEIGHT_PX }}>
        {topBids.map((level, i) => (
          <Row
            key={level.px}
            px={level.px}
            sz={bidDisplaySizes[i]}
            total={bidTotals[i]}
            maxTotal={maxTotal}
            side="bid"
            szDecimals={szDecimals}
            flash={flashedPrices.has(level.px)}
          />
        ))}
      </div>
    </div>
  );
}
