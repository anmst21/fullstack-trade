"use client";

import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
}

function getSnapshot() {
  return !document.hidden;
}

function getServerSnapshot() {
  return true;
}

export function usePageVisible() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
