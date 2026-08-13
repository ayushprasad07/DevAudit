from __future__ import annotations

import re

"""
Common headings found in release notes.
Everything should be lowercase.
"""

BREAKING_HEADINGS = {
    "breaking",
    "breaking change",
    "breaking changes",
}

DEPRECATION_HEADINGS = {
    "deprecated",
    "deprecation",
    "deprecations",
}

REMOVAL_HEADINGS = {
    "removed",
    "removal",
    "removed features",
}

CONFIGURATION_HEADINGS = {
    "configuration",
    "config",
    "configuration changes",
}

SECURITY_HEADINGS = {
    "security",
    "security fixes",
    "security updates",
}

PERFORMANCE_HEADINGS = {
    "performance",
    "performance improvements",
}

BEHAVIOR_HEADINGS = {
    "behavior",
    "behavior changes",
    "behavioral changes",
}

MIGRATION_HEADINGS = {
    "migration",
    "migration guide",
    "upgrade guide",
}

REMOVAL_KEYWORDS = {
    "removed",
    "remove",
    "deleted",
    "delete",
    "dropped",
    "drop",
    "eliminated",
}

DEPRECATION_KEYWORDS = {
    "deprecated",
    "deprecation",
    "will be removed",
    "scheduled for removal",
}

API_CHANGE_KEYWORDS = {
    "renamed",
    "changed",
    "updated",
    "signature",
    "parameter",
    "return type",
    "requires",
    "must",
}

CONFIGURATION_KEYWORDS = {
    "configuration",
    "config",
    "environment variable",
    ".env",
    "setting",
}

SECURITY_KEYWORDS = {
    "security",
    "vulnerability",
    "cve",
    "exploit",
    "permission",
    "authentication",
    "authorization",
}

PERFORMANCE_KEYWORDS = {
    "performance",
    "optimization",
    "memory",
    "cache",
    "faster",
    "latency",
}

"""
    Regexes to extract common patterns from release notes.
"""

URL_PATTERN = re.compile(
    r"https?://\S+"
)

FILE_PATTERN = re.compile(
    r"\b[\w\-]+\.(?:py|ts|tsx|js|jsx|json|yaml|yml|toml|ini|cfg|env|md)\b"
)

API_PATTERN = re.compile(
    r"\b[A-Za-z_][A-Za-z0-9_]*(?:[./][A-Za-z0-9_]+)+\b"
)

CONFIG_PATTERN = re.compile(
    r"\b[A-Z][A-Z0-9_]{2,}\b"
)

VERSION_PATTERN = re.compile(
    r"\b\d+\.\d+(?:\.\d+)?\b"
)

WORD_PATTERN = re.compile(
    r"[a-zA-Z]+"
)