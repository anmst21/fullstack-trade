import type { Level } from "@/hooks/use-hyperliquid";

export function applyGrouping(
  levels: Level[],
  group: number,
  side: "bid" | "ask",
): Level[] {
  if (group <= 0) return levels;
  const buckets = new Map<number, number>();
  for (const level of levels) {
    const price = parseFloat(level.px);
    const size = parseFloat(level.sz);
    const raw =
      side === "bid"
        ? Math.floor(price / group) * group
        : Math.ceil(price / group) * group;
    const bucket = parseFloat(raw.toPrecision(10));
    buckets.set(bucket, (buckets.get(bucket) || 0) + size);
  }
  return Array.from(buckets.entries()).map(([px, sz]) => ({
    px: String(px),
    sz: String(sz),
    n: 1,
  }));
}
