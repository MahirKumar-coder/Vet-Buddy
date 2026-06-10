import { createClient } from "redis";

let redisClient = null;
let isRedisConnected = false;

/**
 * Initializes and connects to the Redis client.
 * Fails gracefully if Redis is unavailable.
 */
export const connectRedis = async () => {
  const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
  
  if (process.env.ENABLE_REDIS === "false") {
    console.log("ℹ️ Redis is explicitly disabled via ENABLE_REDIS environment variable.");
    return;
  }

  try {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.warn("⚠️ Redis reconnect retries exceeded. Proceeding without Redis cache.");
            isRedisConnected = false;
            return false; // Stop reconnecting
          }
          return Math.min(retries * 500, 2000); // Backoff strategy
        }
      }
    });

    redisClient.on("error", (err) => {
      console.warn("⚠️ Redis client error:", err.message || err);
      isRedisConnected = false;
    });

    redisClient.on("connect", () => {
      console.log("🔌 Redis client connecting...");
    });

    redisClient.on("ready", () => {
      console.log("✅ Redis connected and ready");
      isRedisConnected = true;
    });

    await redisClient.connect();
  } catch (error) {
    console.warn(`⚠️ Failed to initialize Redis connection: ${error.message}. Gracefully running without cache.`);
    isRedisConnected = false;
  }
};

/**
 * Retrieves a parsed value from the Redis cache.
 * @param {string} key 
 * @returns {Promise<any>}
 */
export const getCache = async (key) => {
  if (!isRedisConnected || !redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.warn(`⚠️ Error reading key "${key}" from Redis:`, err.message);
    return null;
  }
};

/**
 * Serializes and sets a value in the Redis cache with a TTL (Time To Live).
 * @param {string} key 
 * @param {any} value 
 * @param {number} ttlSeconds Default is 3600 (1 hour)
 */
export const setCache = async (key, value, ttlSeconds = 3600) => {
  if (!isRedisConnected || !redisClient) return;
  try {
    const serialized = JSON.stringify(value);
    await redisClient.set(key, serialized, {
      EX: ttlSeconds,
    });
  } catch (err) {
    console.warn(`⚠️ Error writing key "${key}" to Redis:`, err.message);
  }
};

/**
 * Deletes a specific key from the Redis cache.
 * @param {string} key 
 */
export const deleteCache = async (key) => {
  if (!isRedisConnected || !redisClient) return;
  try {
    await redisClient.del(key);
  } catch (err) {
    console.warn(`⚠️ Error deleting key "${key}" from Redis:`, err.message);
  }
};

/**
 * Clears keys matching a wildcard pattern from the Redis cache using SCAN to avoid blocking.
 * @param {string} pattern E.g. "products:*"
 */
export const clearCachePattern = async (pattern) => {
  if (!isRedisConnected || !redisClient) return;
  try {
    let cursor = 0;
    do {
      const reply = await redisClient.scan(cursor, {
        MATCH: pattern,
        COUNT: 100,
      });
      cursor = reply.cursor;
      const keys = reply.keys;
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } while (cursor !== 0);
  } catch (err) {
    console.warn(`⚠️ Error clearing cache pattern "${pattern}" from Redis:`, err.message);
  }
};
