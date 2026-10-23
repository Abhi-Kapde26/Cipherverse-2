/**
 * High-performance, in-memory sliding window rate limiter.
 * Avoids database roundtrips and lock contention under heavy concurrency (100+ teams).
 */

class MemoryRateLimiter {
  private attempts = new Map<string, number>();
  private lastCleanup = Date.now();

  /**
   * Check if an action for a given key is allowed based on minIntervalMs.
   */
  check(key: string, minIntervalMs: number): { allowed: boolean; waitRemainingSeconds?: number } {
    const now = Date.now();
    this.periodicCleanup(now);

    const lastAttempt = this.attempts.get(key);
    if (lastAttempt && now - lastAttempt < minIntervalMs) {
      const waitRemainingSeconds = Math.ceil((minIntervalMs - (now - lastAttempt)) / 1000);
      return { allowed: false, waitRemainingSeconds };
    }

    this.attempts.set(key, now);
    return { allowed: true };
  }

  /**
   * Reset rate limit for a given key.
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  /**
   * Reset all rate limits (used during tournament factory reset).
   */
  resetAll(): void {
    this.attempts.clear();
  }

  /**
   * Periodically remove old entries every 60 seconds to prevent memory leaks.
   */
  private periodicCleanup(now: number): void {
    if (now - this.lastCleanup > 60000) {
      this.lastCleanup = now;
      this.attempts.forEach((timestamp, key) => {
        if (now - timestamp > 60000) {
          this.attempts.delete(key);
        }
      });
    }
  }
}

export const memoryRateLimiter = new MemoryRateLimiter();
