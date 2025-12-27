import { useSyncExternalStore } from "react";

let mounted = false;
const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): boolean {
  return mounted;
}

function getServerSnapshot(): boolean {
  return false;
}

function setMounted(): void {
  if (!mounted) {
    mounted = true;
    listeners.forEach((listener) => listener());
  }
}

// Auto-mount on client side
if (typeof window !== "undefined") {
  setMounted();
}

export function useMounted(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
