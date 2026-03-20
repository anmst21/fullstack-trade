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
}

const WS_URL = 'wss://api.hyperliquid.xyz/ws';
const MAX_TRADES = 50;
const RECONNECT_DELAY = 2000;

export function useHyperliquid(coin = 'BTC') {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [book, setBook] = useState<Book>({ bids: [], asks: [] });
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmounted = useRef(false);

  useEffect(() => {
    unmounted.current = false;

    function connect() {
      if (unmounted.current) return;

      const socket = new WebSocket(WS_URL);
      ws.current = socket;

      socket.onopen = () => {
        socket.send(JSON.stringify({ method: 'subscribe', subscription: { type: 'trades', coin } }));
        socket.send(JSON.stringify({ method: 'subscribe', subscription: { type: 'l2Book', coin } }));
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.channel === 'trades' && Array.isArray(msg.data)) {
            setTrades((prev) => {
              const next = [...msg.data, ...prev];
              return next.slice(0, MAX_TRADES);
            });
          }

          if (msg.channel === 'l2Book' && msg.data?.levels) {
            const [bids, asks] = msg.data.levels as [Level[], Level[]];
            setBook({ bids, asks });
          }
        } catch {
          // ignore malformed frames
        }
      };

      socket.onclose = () => {
        if (!unmounted.current) {
          reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
        }
      };

      socket.onerror = () => {
        socket.close();
      };
    }

    connect();

    return () => {
      unmounted.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      ws.current?.close();
    };
  }, [coin]);

  return { trades, book };
}
