'use client';

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      setStoredValue(item !== null ? (JSON.parse(item) as T) : initialValue);
    } catch (err) {
      console.warn('[useLocalStorage] failed to read key:', key, err);
    }
    // initialValue is a default, not a reactive dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch (err) {
          console.warn('[useLocalStorage] failed to write key:', key, err);
        }
        return next;
      });
    },
    [key],
  );

  return [storedValue, setValue] as const;
}
