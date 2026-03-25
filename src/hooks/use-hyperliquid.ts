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

function bookSub(coin: string, nSigFigs?: number) {
  return { type: "l2Book" as const, coin, ...(nSigFigs ? { nSigFigs } : {}) };
}

const BOOK_THROTTLE_MS = 200; // ~5 updates/sec — each l2Book msg is a full snapshot

export function useHyperliquid(coin = "BTC", nSigFigs?: 2 | 3 | 4 | 5, paused = false) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [book, setBook] = useState<Book>(EMPTY_BOOK);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sigFigsRef = useRef(nSigFigs);
  const prevSigFigsRef = useRef(nSigFigs);
  const pausedRef = useRef(paused);
  const lastBookUpdateRef = useRef(0);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // --- Main effect: socket lifecycle, depends only on coin ---
  useEffect(() => {
    let aborted = false;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on coin change
    setBook(EMPTY_BOOK);
    setTrades([]);
    lastBookUpdateRef.current = 0;

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
            subscription: bookSub(coin, sigFigsRef.current),
          }),
        );
      };

      socket.onmessage = (event) => {
        if (aborted || pausedRef.current) return;
        try {
          const msg = JSON.parse(event.data);

          if (msg.channel === "trades" && Array.isArray(msg.data)) {
            setTrades((prev) => [...msg.data, ...prev].slice(0, MAX_TRADES));
          }

          if (msg.channel === "l2Book" && msg.data?.levels) {
            const now = Date.now();
            if (now - lastBookUpdateRef.current < BOOK_THROTTLE_MS) return;
            lastBookUpdateRef.current = now;

            const [bids, asks] = msg.data.levels as [Level[], Level[]];
            setBook((prev) => ({
              bids: bids.length > 0 ? bids : prev.bids,
              asks: asks.length > 0 ? asks : prev.asks,
              spread: msg.data.spread ?? null,
            }));
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
            subscription: bookSub(coin, sigFigsRef.current),
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
  }, [coin]);

  // --- Resubscribe effect: swap l2Book subscription when nSigFigs changes ---
  useEffect(() => {
    const prev = prevSigFigsRef.current;
    prevSigFigsRef.current = nSigFigs;
    sigFigsRef.current = nSigFigs;

    // Skip on first mount (main effect handles initial subscribe)
    if (prev === nSigFigs) return;

    const socket = ws.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    // Unsubscribe old, subscribe new — don't clear book, let new snapshot overwrite.
    socket.send(
      JSON.stringify({
        method: "unsubscribe",
        subscription: bookSub(coin, prev),
      }),
    );
    socket.send(
      JSON.stringify({
        method: "subscribe",
        subscription: bookSub(coin, nSigFigs),
      }),
    );
  }, [coin, nSigFigs]);

  return { trades, book };
}
