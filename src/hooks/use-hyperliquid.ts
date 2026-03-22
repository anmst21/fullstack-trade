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

export function useHyperliquid(coin = "BTC", nSigFigs?: 2 | 3 | 4 | 5) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [book, setBook] = useState<Book>(EMPTY_BOOK);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track current nSigFigs so onopen always subscribes with the latest value.
  const sigFigsRef = useRef(nSigFigs);
  const prevSigFigsRef = useRef(nSigFigs);
  // Number of l2Book frames to skip after resubscribe (stale frames from old sub).
  const skipCountRef = useRef(0);

  // --- Main effect: socket lifecycle, depends only on coin ---
  useEffect(() => {
    let aborted = false;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on coin change
    setBook(EMPTY_BOOK);
    setTrades([]);

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
        if (aborted) return;
        try {
          const msg = JSON.parse(event.data);

          if (msg.channel === "trades" && Array.isArray(msg.data)) {
            setTrades((prev) => [...msg.data, ...prev].slice(0, MAX_TRADES));
          }

          if (msg.channel === "l2Book" && msg.data?.levels) {
            // After resubscribe, skip one stale frame from the old subscription
            if (skipCountRef.current > 0) { skipCountRef.current--; return; }
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

    // Clear book so skeleton shows during transition, skip one stale frame
    // from the old subscription before accepting the new snapshot.
    skipCountRef.current = 1;
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: sync state with WS resubscribe */
    setBook(EMPTY_BOOK);

    // Unsubscribe old, subscribe new — on the same live connection.
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
