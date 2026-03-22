export function fmt(n: number | string, decimals = 2, minDecimals = 0) {
  return (typeof n === "string" ? parseFloat(n) : n).toLocaleString("en-US", {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtPrice(n: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: n < 1 ? 6 : 2,
  });
}

export function fmtGroup(n: number): string {
  if (n < 1) return n.toString();
  return n.toLocaleString("en-US");
}

export function formatTime(ms: number) {
  return new Date(ms).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
