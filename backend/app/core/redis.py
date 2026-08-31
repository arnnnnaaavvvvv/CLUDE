import redis.asyncio as aioredis
from app.core.config import settings
from typing import Optional

redis_client: Optional[aioredis.Redis] = None


async def get_redis_client() -> aioredis.Redis:
    global redis_client
    if redis_client is None:
        redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
    return redis_client


async def check_rate_limit(key: str, limit: int = 60, window_seconds: int = 60) -> bool:
    """
    Sliding window rate limiter using Redis.
    Returns True if allowed, False if exceeded.
    """
    client = await get_redis_client()
    current_count = await client.incr(f"ratelimit:{key}")
    if current_count == 1:
        await client.expire(f"ratelimit:{key}", window_seconds)
    return current_count <= limit
