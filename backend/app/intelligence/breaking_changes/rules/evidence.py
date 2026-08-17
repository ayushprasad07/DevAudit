from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(slots=True)
class Evidence:
    score: float
    reason: str


@dataclass(slots=True)
class RuleResult:
    matched: bool
    confidence: float
    evidence: list[Evidence] = field(default_factory=list)