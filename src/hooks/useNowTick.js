import { useState, useEffect } from 'react';

/**
 * Re-renders the calling component every `intervalMs`, returning the current
 * timestamp. Used anywhere UI needs to reflect the passage of time without a
 * corresponding localStorage write — e.g. an online dot that should turn grey
 * 5 minutes after the last heartbeat, or a typing indicator that should
 * disappear 3 seconds after the last keystroke, even though nothing new was
 * written in that window.
 */
export function useNowTick(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
