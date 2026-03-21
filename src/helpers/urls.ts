export const HYPERLIQUID_WS = 'wss://api.hyperliquid.xyz/ws';
export const HYPERLIQUID_API = 'https://api.hyperliquid.xyz/info';
export const FULLSTACK_TRADE_URL = 'https://www.fullstack.trade/';

export function explorerTxUrl(hash: string): string {
  return `https://app.hyperliquid.xyz/explorer/tx/${hash}`;
}

export function coinIconUrl(coin: string): string {
  return `https://app.hyperliquid.xyz/coins/${coin}.svg`;
}
