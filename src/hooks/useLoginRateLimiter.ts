import { useState, useCallback } from 'react';

interface RateLimitState {
  attempts: number;
  lockedUntil: number | null;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export function useLoginRateLimiter() {
  const [rateLimitState, setRateLimitState] = useState<RateLimitState>(() => {
    const stored = localStorage.getItem('login_rate_limit');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Clear old data if window expired
        if (parsed.lastAttempt && Date.now() - parsed.lastAttempt > ATTEMPT_WINDOW_MS) {
          localStorage.removeItem('login_rate_limit');
          return { attempts: 0, lockedUntil: null };
        }
        return parsed;
      } catch {
        return { attempts: 0, lockedUntil: null };
      }
    }
    return { attempts: 0, lockedUntil: null };
  });

  const isLocked = useCallback(() => {
    if (rateLimitState.lockedUntil && Date.now() < rateLimitState.lockedUntil) {
      return true;
    }
    // Clear lockout if expired
    if (rateLimitState.lockedUntil && Date.now() >= rateLimitState.lockedUntil) {
      const newState = { attempts: 0, lockedUntil: null };
      setRateLimitState(newState);
      localStorage.setItem('login_rate_limit', JSON.stringify({ ...newState, lastAttempt: Date.now() }));
    }
    return false;
  }, [rateLimitState.lockedUntil]);

  const getRemainingLockoutTime = useCallback(() => {
    if (rateLimitState.lockedUntil && Date.now() < rateLimitState.lockedUntil) {
      return Math.ceil((rateLimitState.lockedUntil - Date.now()) / 1000 / 60); // minutes
    }
    return 0;
  }, [rateLimitState.lockedUntil]);

  const getRemainingAttempts = useCallback(() => {
    return Math.max(0, MAX_ATTEMPTS - rateLimitState.attempts);
  }, [rateLimitState.attempts]);

  const recordFailedAttempt = useCallback(() => {
    const newAttempts = rateLimitState.attempts + 1;
    const newLockedUntil = newAttempts >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_DURATION_MS : null;
    
    const newState = {
      attempts: newAttempts,
      lockedUntil: newLockedUntil,
      lastAttempt: Date.now(),
    };
    
    setRateLimitState({ attempts: newAttempts, lockedUntil: newLockedUntil });
    localStorage.setItem('login_rate_limit', JSON.stringify(newState));
  }, [rateLimitState.attempts]);

  const resetOnSuccess = useCallback(() => {
    const newState = { attempts: 0, lockedUntil: null };
    setRateLimitState(newState);
    localStorage.removeItem('login_rate_limit');
  }, []);

  return {
    isLocked,
    getRemainingLockoutTime,
    getRemainingAttempts,
    recordFailedAttempt,
    resetOnSuccess,
  };
}
