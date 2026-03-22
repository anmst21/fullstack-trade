"use client";

import { useEffect, useState } from "react";
import { useHyperliquid } from "@/hooks/use-hyperliquid";
import { useCoin } from "@/context/coin";
import Book from "./book";
import BookColumnHeader from "./column-header";
import BottomBar from "./bottom-bar";

export const MULTIPLIERS = [1, 2, 5, 10, 100, 1000];
const NSIGFIGS_BY_IDX = [5, 4, 4, 3, 2, 2] as const;

function readStorage<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function removeStorage(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {}
}

export default function OrderBook() {
  const { coin } = useCoin();

  // --- group idx: persist per reload, reset to 0 on coin switch ---
  const [groupState, setGroupState] = useState({ coin, idx: 0 });
  if (groupState.coin !== coin) {
    setGroupState({ coin, idx: 0 });
    removeStorage("ob-group");
  }
  // Hydrate from localStorage on mount only (avoids SSR mismatch)
  useEffect(() => {
    const stored = readStorage<{ coin: string; idx: number }>("ob-group");
    if (stored && stored.coin === coin) setGroupState(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const groupIdx = groupState.idx;
  const setGroupIdx = (idx: number) => {
    const next = { coin, idx };
    setGroupState(next);
    writeStorage("ob-group", next);
  };

  // --- asset unit: persist per reload, reset to coin on coin switch ---
  const [unitState, setUnitState] = useState({
    coin,
    unit: "coin" as "USDC" | "coin",
  });
  if (unitState.coin !== coin) {
    setUnitState({ coin, unit: "coin" });
    removeStorage("ob-asset-unit");
  }
  useEffect(() => {
    const stored = readStorage<{ coin: string; unit: "USDC" | "coin" }>(
      "ob-asset-unit",
    );
    if (stored && stored.coin === coin) setUnitState(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const asset = unitState.unit === "USDC" ? "USDC" : coin;
  const setAsset = (v: string) => {
    const unit = v === "USDC" ? ("USDC" as const) : ("coin" as const);
    const next = { coin, unit };
    setUnitState(next);
    writeStorage("ob-asset-unit", next);
  };

  const nSigFigs = NSIGFIGS_BY_IDX[groupIdx];
  const { book } = useHyperliquid(coin, nSigFigs);

  const refPrice = book.asks[0]?.px ?? book.bids[0]?.px;
  const [groupOptions, setGroupOptions] = useState<number[]>(() => {
    const mag = refPrice ? Math.floor(Math.log10(parseFloat(refPrice))) : 4;
    const step = parseFloat(Math.pow(10, mag - 4).toPrecision(6));
    return MULTIPLIERS.map((m) => parseFloat((step * m).toPrecision(6)));
  });

  if (refPrice) {
    const magnitude = Math.floor(Math.log10(parseFloat(refPrice)));
    const step = parseFloat(Math.pow(10, magnitude - 4).toPrecision(6));
    const next = MULTIPLIERS.map((m) => parseFloat((step * m).toPrecision(6)));
    if (next[0] !== groupOptions[0]) {
      setGroupOptions(next);
    }
  }

  const group = groupOptions[groupIdx];
  const empty = book.bids.length === 0 && book.asks.length === 0;
  const [loadedCoin, setLoadedCoin] = useState<string | null>(null);
  if (!empty && loadedCoin !== coin) setLoadedCoin(coin);
  const isLoading = loadedCoin !== coin && empty;

  return (
    <>
      <BookColumnHeader asset={asset} />
      <div className="overflow-y-auto" style={{ height: 'var(--book-scroll-h)' }}>
        <Book
          bids={book.bids}
          asks={book.asks}
          spread={book.spread}
          asset={asset}
          group={group}
        />
      </div>
      <BottomBar
        coin={coin}
        asset={asset}
        onAssetChange={setAsset}
        groupIdx={groupIdx}
        groupOptions={groupOptions}
        onGroupIdxChange={setGroupIdx}
        isLoading={isLoading}
      />
    </>
  );
}
