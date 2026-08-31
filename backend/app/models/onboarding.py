import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base, GUID, JSONType


class OnboardingWalkthrough(Base):
    __tablename__ = "onboarding_walkthroughs"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    repo_id = Column(GUID, ForeignKey("repos.id", ondelete="CASCADE"), nullable=False, index=True)
    commit_sha = Column(String(40), nullable=False)
    status = Column(String(50), default="GENERATING")
    summary = Column(Text, nullable=True)
    system_diagram_mermaid = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    repo = relationship("Repository", back_populates="walkthroughs")
    sections = relationship("WalkthroughSection", back_populates="walkthrough", cascade="all, delete-orphan", order_by="WalkthroughSection.display_order")


class WalkthroughSection(Base):
    __tablename__ = "walkthrough_sections"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    walkthrough_id = Column(GUID, ForeignKey("onboarding_walkthroughs.id", ondelete="CASCADE"), nullable=False, index=True)
    section_type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    content_markdown = Column(Text, nullable=False)
    risk_level = Column(String(20), nullable=True)
    referenced_files = Column(JSONType, nullable=False, default=list)
    display_order = Column(Integer, nullable=False)

    walkthrough = relationship("OnboardingWalkthrough", back_populates="sections")
