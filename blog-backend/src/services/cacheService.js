import NodeCache from 'node-cache';
import { logger } from '../config/logger.js';

class CacheService {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: 300, 
      checkperiod: 60,
    });
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value, ttl = 300) {
    return this.cache.set(key, value, ttl);
  }

  del(key) {
    return this.cache.del(key);
  }

  flush() {
    return this.cache.flushAll();
  }

  async getOrSet(key, fn, ttl = 300) {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const result = await fn();
    this.set(key, result, ttl);
    return result;
  }
}

export default new CacheService();