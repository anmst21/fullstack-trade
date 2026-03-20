'use client';

import { useEffect, useRef, useState } from 'react';

export interface Trade {
  coin: string;
  side: 'B' | 'A';
  px: string;
  sz: string;
  time: number;
  hash: string;
}

export interface Level {
  px: string;
  sz: string;
  n: number;
}

export interface Book {
  bids: Level[];
  asks: Level[];
  spread: string | null;
}

const WS_URL = 'wss://api.hyperliquid.xyz/ws';
const MAX_TRADES = 50;
const RECONNECT_DELAY = 2000;

export function useHyperliquid(coin = 'BTC', nSigFigs?: 2 | 3 | 4 | 5) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [book, setBook] = useState<Book>({ bids: [], asks: [] });
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connId = useRef(0); // incremented on each effect run to invalidate stale callbacks

  useEffect(() => {
    const id = ++connId.current;
    setBook({ bids: [], asks: [], spread: null });
    setTrades([]);

    function connect() {
      if (id !== connId.current) return; // stale — a newer effect has taken over

      const socket = new WebSocket(WS_URL);
      ws.current = socket;

      socket.onopen = () => {
        socket.send(JSON.stringify({ method: 'subscribe', subscription: { type: 'trades', coin } }));
        socket.send(JSON.stringify({ method: 'subscribe', subscription: { type: 'l2Book', coin, ...(nSigFigs ? { nSigFigs } : {}) } }));
      };

      socket.onmessage = (event) => {
        if (id !== connId.current) return;
        try {
          const msg = JSON.parse(event.data);
          console.log('[HL WS]', msg);

          if (msg.channel === 'trades' && Array.isArray(msg.data)) {
            setTrades((prev) => [...msg.data, ...prev].slice(0, MAX_TRADES));
          }

          if (msg.channel === 'l2Book' && msg.data?.levels) {
            const [bids, asks] = msg.data.levels as [Level[], Level[]];
            setBook({ bids, asks, spread: msg.data.spread ?? null });
          }
        } catch {
          // ignore malformed frames
        }
      };

      socket.onclose = () => {
        if (id !== connId.current) return; // intentionally replaced — do not reconnect
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
      };

      socket.onerror = () => {
        socket.close();
      };
    }

    connect();

    return () => {
      connId.current++; // invalidate this effect's callbacks
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      ws.current?.close();
    };
  }, [coin, nSigFigs]);

  return { trades, book };
}
