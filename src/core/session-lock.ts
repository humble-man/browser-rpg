import { useEffect, useRef, useState } from 'react';

const LOCK_KEY = 'browser-rpg.sessionLock';
const HEARTBEAT_MS = 5000;
const STALE_MS = 15000;

interface LockData {
  tabId: string;
  timestamp: number;
}

export type LockStatus =
  | { kind: 'idle' }
  | { kind: 'owned' }
  | { kind: 'conflict' }
  | { kind: 'preempted' };

function readLock(): LockData | null {
  try {
    const raw = localStorage.getItem(LOCK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LockData;
    if (typeof parsed?.tabId !== 'string' || typeof parsed?.timestamp !== 'number') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeLock(data: LockData): void {
  try {
    localStorage.setItem(LOCK_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[session-lock] write failed:', e);
  }
}

function clearLockIfMine(tabId: string): void {
  try {
    const current = readLock();
    if (current?.tabId === tabId) {
      localStorage.removeItem(LOCK_KEY);
    }
  } catch {
    /* ignore */
  }
}

function isStale(lock: LockData): boolean {
  return Math.abs(Date.now() - lock.timestamp) >= STALE_MS;
}

function generateTabId(): string {
  return `tab_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

export function useTabLock(active: boolean): {
  status: LockStatus;
  takeOver: () => void;
} {
  const tabIdRef = useRef<string>('');
  if (!tabIdRef.current) {
    tabIdRef.current = generateTabId();
  }
  const [status, setStatus] = useState<LockStatus>({ kind: 'idle' });
  const heartbeatRef = useRef<number | null>(null);

  const stopHeartbeat = () => {
    if (heartbeatRef.current !== null) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  const startHeartbeat = () => {
    stopHeartbeat();
    heartbeatRef.current = window.setInterval(() => {
      writeLock({ tabId: tabIdRef.current, timestamp: Date.now() });
    }, HEARTBEAT_MS);
  };

  const acquire = () => {
    writeLock({ tabId: tabIdRef.current, timestamp: Date.now() });
    setStatus({ kind: 'owned' });
    startHeartbeat();
  };

  const release = () => {
    stopHeartbeat();
    clearLockIfMine(tabIdRef.current);
    setStatus({ kind: 'idle' });
  };

  const takeOver = () => {
    acquire();
  };

  useEffect(() => {
    if (!active) {
      release();
      return;
    }

    const existing = readLock();
    if (!existing || existing.tabId === tabIdRef.current || isStale(existing)) {
      acquire();
    } else {
      setStatus({ kind: 'conflict' });
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key !== LOCK_KEY) return;
      const lock = readLock();
      if (lock && lock.tabId !== tabIdRef.current) {
        stopHeartbeat();
        setStatus({ kind: 'preempted' });
      }
    };

    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    const onBeforeUnload = () => clearLockIfMine(tabIdRef.current);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      stopHeartbeat();
    };
  }, []);

  return { status, takeOver };
}
