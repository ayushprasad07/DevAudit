from enum import Enum
from pydantic import BaseModel, Field


class SafetyStatus(str, Enum):
    ALLOW = "allow"
    REVIEW = "review"
    BLOCK = "block"


class FindingSeverity(str, Enum):
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class SafetyFinding(BaseModel):
    rule: str
    severity: FindingSeverity
    message: str
    path: str | None = None
    evidence: str | None = None


class SafetyMetadata(BaseModel):
    file_count: int = 0
    total_size_bytes: int = 0
    inspected_files: int = 0


class SafetyAssessment(BaseModel):
    status: SafetyStatus
    findings: list[SafetyFinding] = Field(default_factory=list)
    metadata: SafetyMetadata = Field(default_factory=SafetyMetadata)