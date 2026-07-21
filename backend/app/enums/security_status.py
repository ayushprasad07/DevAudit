from enum import Enum


class SecurityStatus(str, Enum):

    SAFE = "safe"

    WARNING = "warning"

    CRITICAL = "critical"