from dataclasses import dataclass, field
from typing import Optional, List

from app.entity.package_info import PackageInfo

from app.enums.update_type import UpdateType

from app.entity.vulnerability import Vulnerability

@dataclass
class DependencyReport:

    package : PackageInfo

    is_outdated : bool = False

    update_type : UpdateType = UpdateType.NONE

    license_risk : str = "unknown"

    vulnerabilities: List[Vulnerability] = field(default_factory=list)

    breaking_changes: List[str] = field(default_factory=list)

    confidence: float = 0.0

