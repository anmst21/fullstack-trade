'use client';

import { useEffect, useRef, useState } from 'react';
import { HYPERLIQUID_WS } from '@/helpers/urls';

const RECONNECT_DELAY = 2000;

export function useLastPrice(coin: string, paused = false) {
  const [lastPrice, setLastPrice] = useState<number | undefined>();
  const [prevPrice, setPrevPrice] = useState<number | undefined>();
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    let aborted = false;

    // Reset immediately so the UI shows a loading skeleton while reconnecting.
    /* eslint-disable react-hooks/set-state-in-effect */
    setLastPrice(undefined);
    setPrevPrice(undefined);
    /* eslint-enable react-hooks/set-state-in-effect */

    function connect() {
      if (aborted) return;
      const socket = new WebSocket(HYPERLIQUID_WS);
      ws.current = socket;

      socket.onopen = () => {
        socket.send(JSON.stringify({
          method: 'subscribe',
          subscription: { type: 'trades', coin },
        }));
      };

      socket.onmessage = (event) => {
        if (aborted || pausedRef.current) return;
        try {
          const msg = JSON.parse(event.data);
          if (msg.channel === 'trades' && Array.isArray(msg.data) && msg.data.length > 0) {
            const price = parseFloat(msg.data[0].px);
            setLastPrice((prev) => {
              setPrevPrice(prev);
              return price;
            });
          }
        } catch (err) {
          console.warn('[useLastPrice] malformed WebSocket frame', err);
        }
      };

      socket.onclose = () => {
        if (aborted) return;
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
      };

      socket.onerror = () => socket.close();
    }

    connect();

    return () => {
      aborted = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      const socket = ws.current;
      ws.current = null;
      if (!socket) return;

      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          method: 'unsubscribe',
          subscription: { type: 'trades', coin },
        }));
        socket.close(1000, 'unmounting');
      } else if (socket.readyState === WebSocket.CONNECTING) {
        socket.onopen = () => socket.close(1000, 'unmounting');
        socket.onmessage = null;
        socket.onerror = () => socket.close();
        socket.onclose = null;
      }
    };
  }, [coin]);

  const direction: 'up' | 'down' | 'neutral' =
    lastPrice === undefined || prevPrice === undefined || lastPrice === prevPrice
      ? 'neutral'
      : lastPrice > prevPrice
        ? 'up'
        : 'down';

  return { lastPrice, prevPrice, direction };
}
