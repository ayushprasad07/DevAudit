from enum import Enum


class SecurityStatus(str, Enum):

    SAFE = "safe"

    VULNERABLE = "vulnerable"

    CRITICAL = "critical"