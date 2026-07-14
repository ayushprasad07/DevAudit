from dataclasses import dataclass, field
from typing import Optional, List

from app.entity.dependency import Dependebcy

@dataclass
class DependencyReport:

    dependency : Dependebcy

    latest_version: Optional[str] = None

    license: Optional[str] = None

    vulnerabilities: List[str] = field(default_factory=list)

    breaking_changes: List[str] = field(default_factory=list)

    migration_guide: Optional[str] = None

    confidence: float = 0.0

