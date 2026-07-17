from dataclasses import dataclass, field
from typing import Optional, List

from app.entity.dependency import Dependebcy
from app.entity.package_info import PackageInfo

@dataclass
class DependencyReport:

    package : PackageInfo

    isOutdated : bool = False

    update_type : str = "none"

    license_risk : str = "unknown"

    vulnerabilities: List[str] = field(default_factory=list)

    breaking_changes: List[str] = field(default_factory=list)

    confidence: float = 0.0

