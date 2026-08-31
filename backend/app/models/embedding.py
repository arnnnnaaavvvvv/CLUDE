import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base, GUID, JSONType


class CodeEmbedding(Base):
    __tablename__ = "embeddings"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    repo_id = Column(GUID, ForeignKey("repos.id", ondelete="CASCADE"), nullable=False, index=True)
    file_path = Column(Text, nullable=False, index=True)
    symbol_name = Column(String(255), nullable=True)
    chunk_type = Column(String(50), nullable=False)
    start_line = Column(Integer, nullable=False)
    end_line = Column(Integer, nullable=False)
    content_raw = Column(Text, nullable=False)
    content_hash = Column(String(64), nullable=False, index=True)
    embedding = Column(JSONType, nullable=True) # JSON / Vector cross-dialect representation
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    repo = relationship("Repository", back_populates="embeddings")
