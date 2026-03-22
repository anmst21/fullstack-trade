import { Row, SpreadBar } from "../book-rows";
import type { LayoutProps } from "../book-rows";
import { DEPTH_ROW_COUNT } from "@/helpers/constants";

export default function SellOrderLayout({
  topAsks,
  askDisplaySizes,
  askTotals,
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
      <div className="flex flex-col" style={{ minHeight: `calc(var(--row-h) * ${DEPTH_ROW_COUNT})` }}>
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
    </div>
  );
}
