import { Row, SpreadBar } from "../book-rows";
import type { LayoutProps } from "../book-rows";
import { ROW_COUNT } from "@/helpers/constants";

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
      <div
        className="flex flex-col justify-end"
        style={{ height: `calc(var(--row-h) * ${ROW_COUNT})` }}
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

      <div className="flex flex-col" style={{ height: `calc(var(--row-h) * ${ROW_COUNT})` }}>
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
