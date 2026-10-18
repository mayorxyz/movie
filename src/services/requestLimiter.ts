// Shared request limiter - max 4 concurrent requests
export class RequestLimiter {
  private maxConcurrent: number;
  private active: number = 0;
  private queue: Array<() => void> = [];

  constructor(maxConcurrent: number = 4) {
    this.maxConcurrent = maxConcurrent;
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active >= this.maxConcurrent) {
      await new Promise<void>(resolve => this.queue.push(resolve));
    }
    this.active++;
    try {
      return await fn();
    } finally {
      this.active--;
      const next = this.queue.shift();
      if (next) next();
    }
  }
}

// Singleton instance for the entire app
export const sharedLimiter = new RequestLimiter(4);
