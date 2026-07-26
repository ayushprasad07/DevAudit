from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum

from app.intelligence.breaking_changes.models import RawRelease


class MigrationStrategy(str, Enum):
    """
    Determines how DevAudit builds the migration path.
    """

    FULL_HISTORY = "full_history"
    MAJOR_ONLY = "major_only"
    MAJOR_MINOR = "major_minor"
    SECURITY = "security"


@dataclass(slots=True, frozen=True)
class MigrationStep:
    """
    Represents one migration jump.
    """

    from_version: str
    to_version: str

    release: RawRelease


@dataclass(slots=True)
class MigrationPath:
    """
    Complete upgrade path.
    """

    current_version: str

    target_version: str

    strategy: MigrationStrategy

    steps: list[MigrationStep] = field(default_factory=list)

    @property
    def major_upgrade(self) -> bool:
        return (
            self.current_version.split(".")[0]
            != self.target_version.split(".")[0]
        )

    @property
    def total_steps(self) -> int:
        return len(self.steps)