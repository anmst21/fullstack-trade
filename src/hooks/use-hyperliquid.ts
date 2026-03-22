"use client";

import { useEffect, useRef, useState } from "react";

export interface Trade {
  coin: string;
  side: "B" | "A";
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

import { HYPERLIQUID_WS } from "@/helpers/urls";

const EMPTY_BOOK: Book = { bids: [], asks: [], spread: null };
const MAX_TRADES = 50;
const RECONNECT_DELAY = 2000;

export function useHyperliquid(coin = "BTC", nSigFigs?: 2 | 3 | 4 | 5) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [book, setBook] = useState<Book>(EMPTY_BOOK);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let aborted = false;

    // Reset immediately so the UI shows a loading skeleton while reconnecting.
    /* eslint-disable react-hooks/set-state-in-effect */
    setBook(EMPTY_BOOK);
    setTrades([]);
    /* eslint-enable react-hooks/set-state-in-effect */

    function connect() {
      if (aborted) return;

      const socket = new WebSocket(HYPERLIQUID_WS);
      ws.current = socket;

      socket.onopen = () => {
        socket.send(
          JSON.stringify({
            method: "subscribe",
            subscription: { type: "trades", coin },
          }),
        );
        socket.send(
          JSON.stringify({
            method: "subscribe",
            subscription: {
              type: "l2Book",
              coin,
              ...(nSigFigs ? { nSigFigs } : {}),
            },
          }),
        );
      };

      socket.onmessage = (event) => {
        if (aborted) return;
        try {
          const msg = JSON.parse(event.data);

          if (msg.channel === "trades" && Array.isArray(msg.data)) {
            setTrades((prev) => [...msg.data, ...prev].slice(0, MAX_TRADES));
          }

          if (msg.channel === "l2Book" && msg.data?.levels) {
            const [bids, asks] = msg.data.levels as [Level[], Level[]];
            setBook({ bids, asks, spread: msg.data.spread ?? null });
          }
        } catch (err) {
          console.warn('[useHyperliquid] malformed WebSocket frame', err);
        }
      };

      socket.onclose = () => {
        if (aborted) return;
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
      };

      socket.onerror = () => {
        socket.close();
      };
    }

    connect();

    return () => {
      aborted = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      const socket = ws.current;
      ws.current = null;
      if (!socket) return;

      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            method: "unsubscribe",
            subscription: { type: "trades", coin },
          }),
        );
        socket.send(
          JSON.stringify({
            method: "unsubscribe",
            subscription: {
              type: "l2Book",
              coin,
              ...(nSigFigs ? { nSigFigs } : {}),
            },
          }),
        );
        socket.close(1000, "unmounting");
      } else if (socket.readyState === WebSocket.CONNECTING) {
        socket.onopen = () => socket.close(1000, "unmounting");
        socket.onmessage = null;
        socket.onerror = () => socket.close();
        socket.onclose = null;
      }
    };
  }, [coin, nSigFigs]);

  return { trades, book };
}
