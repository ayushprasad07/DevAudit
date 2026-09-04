from __future__ import annotations

import re

from app.intelligence.breaking_changes.models import (
    BreakingChangeCategory,
    BreakingChangeSeverity,
)

from app.intelligence.breaking_changes.parser.models import (
    ReleaseItem,
)

from .base import BaseRule
from .evidence import (
    Evidence,
    RuleResult,
)


class DeprecationRule(BaseRule):

    category = BreakingChangeCategory.DEPRECATION
    severity = BreakingChangeSeverity.MAJOR

    @property
    def name(self) -> str:
        return "deprecation"

    _STRONG_PATTERNS = (
        re.compile(
            r"\b(?:is|was|has been|are|have been)?\s*"
            r"deprecated\b",
            re.IGNORECASE,
        ),
        re.compile(
            r"\bdeprecated\s+(?:in|since)\b",
            re.IGNORECASE,
        ),
    )

    _WEAK_PATTERNS = (
        re.compile(
            r"\bno longer recommended\b",
            re.IGNORECASE,
        ),
        re.compile(
            r"\bdiscouraged\b",
            re.IGNORECASE,
        ),
        re.compile(
            r"\bshould no longer be used\b",
            re.IGNORECASE,
        ),
        re.compile(
            r"\bwill be removed\b",
            re.IGNORECASE,
        ),
    )

    def evaluate(
        self,
        item: ReleaseItem,
    ) -> RuleResult:

        text = item.text

        evidence: list[Evidence] = []

        for pattern in self._STRONG_PATTERNS:

            if pattern.search(text):

                evidence.append(
                    Evidence(
                        score=0.75,
                        reason=(
                            "Strong deprecation language detected."
                        ),
                    )
                )

        for pattern in self._WEAK_PATTERNS:

            if pattern.search(text):

                evidence.append(
                    Evidence(
                        score=0.30,
                        reason=(
                            "Weak deprecation language detected."
                        ),
                    )
                )

        if not evidence:
            return RuleResult(
                matched=False,
                confidence=0.0,
            )

        confidence = min(
            1.0,
            sum(
                evidence_item.score
                for evidence_item in evidence
            ),
        )

        return RuleResult(
            matched=confidence >= 0.5,
            confidence=confidence,
            evidence=evidence,
        )