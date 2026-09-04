from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

from app.intelligence.breaking_changes.rules.base import BaseRule
from app.intelligence.breaking_changes.rules.evidence import RuleResult

class DecisionLevel(str, Enum):

    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    NONE = "none"


@dataclass(slots=True)
class RuleEvaluation:
    rule: BaseRule
    result: RuleResult


class DecisionEngine:

    HIGH_THRESHOLD = 0.80
    MEDIUM_THRESHOLD = 0.50

    def classify(
        self,
        evaluation: RuleEvaluation,
    ) -> DecisionLevel:

        confidence = evaluation.result.confidence

        if confidence >= self.HIGH_THRESHOLD:
            return DecisionLevel.HIGH

        if confidence >= self.MEDIUM_THRESHOLD:
            return DecisionLevel.MEDIUM

        if confidence > 0:
            return DecisionLevel.LOW

        return DecisionLevel.NONE