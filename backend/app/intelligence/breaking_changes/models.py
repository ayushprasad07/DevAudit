from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime

class BreakingChangeCategory(Enum):
    API_CHANGE = "api_change"
    CONFIGURATION = "configuration"
    DEPRECATION = "deprecation"
    REMOVAL = "removal"
    BEHAVIOR_CHANGE = "behavior_change"
    SECURITY = "security"
    PERFORMANCE = "performance"
    OTHER = "other"


class BreakingChangeSeverity(Enum):
    BREAKING = "breaking"
    MAJOR = "major"
    MODERATE = "moderate"
    MINOR = "minor"

class BreakingChangeSource(Enum):
    GITHUB_RELEASE = "github_release"
    CHANGELOG = "changelog"
    MIGRATION_GUIDE = "migration_guide"
    DOCUMENTATION = "documentation"
    MANUAL = "manual"

@dataclass(slots=True)
class RawRelease:
    version: str
    title: str
    body: str
    published_at: datetime
    url: str


@dataclass(slots=True)
class BreakingChange:
    version: str

    title: str

    description: str

    category: BreakingChangeCategory

    severity: BreakingChangeSeverity

    source: BreakingChangeSource

    migration_url: str | None = None

    affected_apis: list[str] = field(default_factory=list)

    affected_files: list[str] = field(default_factory=list)

    confidence: float = 1.0

@dataclass(slots=True)
class PackageBreakingChanges:
    package_name: str

    current_version: str

    target_version: str

    breaking_changes: list[BreakingChange] = field(default_factory=list)


@dataclass(slots=True)
class VersionRange:
    current_version: str
    target_version: str