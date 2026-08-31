import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from app.core.database import Base


class CodeEmbedding(Base):
    __tablename__ = "embeddings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repo_id = Column(UUID(as_uuid=True), ForeignKey("repos.id", ondelete="CASCADE"), nullable=False, index=True)
    file_path = Column(Text, nullable=False, index=True)
    symbol_name = Column(String(255), nullable=True)
    chunk_type = Column(String(50), nullable=False) # FUNCTION, CLASS, MODULE, INTERFACE, DOC
    start_line = Column(Integer, nullable=False)
    end_line = Column(Integer, nullable=False)
    content_raw = Column(Text, nullable=False)
    content_hash = Column(String(64), nullable=False, index=True) # SHA-256 for dedup
    embedding = Column(Vector(1536), nullable=True) # 1536-dim vector for pgvector
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    repo = relationship("Repository", back_populates="embeddings")
