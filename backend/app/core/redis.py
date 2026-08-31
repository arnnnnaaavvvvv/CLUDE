import time
from typing import Optional, Dict
from app.core.config import settings

# In-memory sliding window fallback for local execution
_in_memory_rate_limiter: Dict[str, list] = {}
_in_memory_cache: Dict[str, str] = {}


class FallbackRedisClient:
    async def get(self, key: str) -> Optional[str]:
        return _in_memory_cache.get(key)

    async def set(self, key: str, value: str, ex: Optional[int] = None):
        _in_memory_cache[key] = value

    async def incr(self, key: str) -> int:
        now = time.time()
        window = _in_memory_rate_limiter.setdefault(key, [])
        # filter out entries older than 60s
        window[:] = [t for t in window if now - t < 60]
        window.append(now)
        return len(window)

    async def expire(self, key: str, window_seconds: int):
        pass


redis_client = None


async def get_redis_client():
    global redis_client
    if redis_client is None:
        try:
            import redis.asyncio as aioredis
            client = aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                socket_timeout=1.0
            )
            await client.ping()
            redis_client = client
        except Exception:
            redis_client = FallbackRedisClient()
    return redis_client


async def check_rate_limit(key: str, limit: int = 60, window_seconds: int = 60) -> bool:
    """Sliding window rate limiter using Redis with in-memory fallback."""
    now = time.time()
    window = _in_memory_rate_limiter.setdefault(key, [])
    window[:] = [t for t in window if now - t < window_seconds]
    if len(window) >= limit:
        return False
    window.append(now)
    return True
