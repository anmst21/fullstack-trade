'use client';

import { useEffect, useRef, useState } from 'react';

const WS_URL = 'wss://api.hyperliquid.xyz/ws';

export function useLastPrice(coin: string) {
  const [lastPrice, setLastPrice] = useState<number | undefined>();
  const [prevPrice, setPrevPrice] = useState<number | undefined>();
  const ws = useRef<WebSocket | null>(null);
  const connId = useRef(0);

  useEffect(() => {
    const id = ++connId.current;
    setLastPrice(undefined);
    setPrevPrice(undefined);

    function connect() {
      if (id !== connId.current) return;
      const socket = new WebSocket(WS_URL);
      ws.current = socket;

      socket.onopen = () => {
        socket.send(JSON.stringify({
          method: 'subscribe',
          subscription: { type: 'trades', coin },
        }));
      };

      socket.onmessage = (event) => {
        if (id !== connId.current) return;
        try {
          const msg = JSON.parse(event.data);
          if (msg.channel === 'trades' && Array.isArray(msg.data) && msg.data.length > 0) {
            const price = parseFloat(msg.data[0].px);
            setLastPrice((prev) => {
              setPrevPrice(prev);
              return price;
            });
          }
        } catch {}
      };

      socket.onclose = () => {
        if (id !== connId.current) return;
        setTimeout(connect, 2000);
      };

      socket.onerror = () => socket.close();
    }

    connect();

    return () => {
      connId.current++;
      const socket = ws.current;
      ws.current = null;
      socket?.close(1000, 'unmounting');
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
