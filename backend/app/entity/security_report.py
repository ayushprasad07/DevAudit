from dataclasses import dataclass
from typing import List, Optional

from app.entity.vulnerability import Vulnerability
from app.enums.severity import Severity
from app.enums.security_status import SecurityStatus


@dataclass
class SecurityReport:

    status: SecurityStatus

    vulnerability_count: int

    highest_severity: Severity

    minimum_safe_version: Optional[str]

    recommendation: str

    vulnerabilities: List[Vulnerability]