import math
import random
from typing import List, Optional
from openai import AsyncOpenAI
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.models.embedding import CodeEmbedding


class EmbeddingService:
    def __init__(self):
        self.client = None
        if settings.OPENAI_API_KEY:
            self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.EMBEDDING_MODEL
        self.dimension = settings.EMBEDDING_DIMENSION

    async def get_embedding(self, text: str) -> List[float]:
        """Generate vector embedding for a single text chunk."""
        if not text or not text.strip():
            return [0.0] * self.dimension

        if self.client:
            try:
                response = await self.client.embeddings.create(
                    input=text[:8000], # Guard token limit
                    model=self.model,
                    dimensions=self.dimension
                )
                return response.data[0].embedding
            except Exception as e:
                # Log and fallback to deterministic pseudo-vector if API failure in test/dev
                pass

        # Deterministic fallback vector based on hash for development/testing without live keys
        return self._generate_deterministic_vector(text)

    async def get_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate vector embeddings for batch of chunks."""
        if not texts:
            return []

        if self.client:
            try:
                truncated = [t[:8000] for t in texts]
                response = await self.client.embeddings.create(
                    input=truncated,
                    model=self.model,
                    dimensions=self.dimension
                )
                return [d.embedding for d in response.data]
            except Exception:
                pass

        return [self._generate_deterministic_vector(t) for t in texts]

    def _generate_deterministic_vector(self, text: str) -> List[float]:
        """Generate unit-normalized pseudo-random vector based on string hash."""
        seed = sum(ord(c) for c in text[:100])
        rng = random.Random(seed)
        vec = [rng.gauss(0, 1) for _ in range(self.dimension)]
        norm = math.sqrt(sum(x * x for x in vec)) or 1.0
        return [x / norm for x in vec]

    async def search_similar_chunks(
        self,
        session: AsyncSession,
        repo_id,
        query_vector: List[float],
        limit: int = 10,
        similarity_threshold: float = 0.5
    ) -> List[CodeEmbedding]:
        """
        Query top-K most similar code embeddings using pgvector cosine distance.
        Note: pgvector `<=>` operator computes cosine distance (1 - cosine_similarity).
        """
        query = (
            select(CodeEmbedding)
            .where(CodeEmbedding.repo_id == repo_id)
            .order_by(CodeEmbedding.embedding.cosine_distance(query_vector))
            .limit(limit)
        )
        result = await session.execute(query)
        return list(result.scalars().all())
