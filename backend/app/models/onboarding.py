import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base


class OnboardingWalkthrough(Base):
    __tablename__ = "onboarding_walkthroughs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repo_id = Column(UUID(as_uuid=True), ForeignKey("repos.id", ondelete="CASCADE"), nullable=False, index=True)
    commit_sha = Column(String(40), nullable=False)
    status = Column(String(50), default="GENERATING") # GENERATING, COMPLETED, FAILED
    summary = Column(Text, nullable=True)
    system_diagram_mermaid = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    repo = relationship("Repository", back_populates="walkthroughs")
    sections = relationship("WalkthroughSection", back_populates="walkthrough", cascade="all, delete-orphan", order_by="WalkthroughSection.display_order")


class WalkthroughSection(Base):
    __tablename__ = "walkthrough_sections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    walkthrough_id = Column(UUID(as_uuid=True), ForeignKey("onboarding_walkthroughs.id", ondelete="CASCADE"), nullable=False, index=True)
    section_type = Column(String(50), nullable=False) # OVERVIEW, CRITICAL_PATH, DANGER_ZONE, DATA_FLOW, SETUP_GUIDE
    title = Column(String(255), nullable=False)
    content_markdown = Column(Text, nullable=False)
    risk_level = Column(String(20), nullable=True) # LOW, MEDIUM, HIGH, CRITICAL
    referenced_files = Column(JSONB, nullable=False, default=list)
    display_order = Column(Integer, nullable=False)

    walkthrough = relationship("OnboardingWalkthrough", back_populates="sections")
