from __future__ import annotations

import re

from app.intelligence.breaking_changes.parser.models import (
    ReleaseItem,
)

from .base import BaseRule
from .evidence import (
    Evidence,
    RuleResult,
)

from app.intelligence.breaking_changes.models import (
    BreakingChangeCategory,
    BreakingChangeSeverity
)


class RemovalRule(BaseRule):

    category = BreakingChangeCategory.REMOVAL
    severity = BreakingChangeSeverity.BREAKING

    @property
    def name(self) -> str:
        return "removal"

    _STRONG_PATTERNS = (
        re.compile(
            r"\b(?:was|were|has been|have been|is|are)\s+removed\b",
            re.IGNORECASE,
        ),
        re.compile(
            r"\bno longer supported\b",
            re.IGNORECASE,
        ),
        re.compile(
            r"\b(?:drop|dropped|remove|removed)\s+support\s+for\b",
            re.IGNORECASE,
        ),
        re.compile(
            r"\bno longer available\b",
            re.IGNORECASE,
        ),
        re.compile(
            r"\bdiscontinued\b",
            re.IGNORECASE,
        ),
        re.compile(
            r"\bretired\b",
            re.IGNORECASE,
        ),
        re.compile(
            r"\bsunset\b",
            re.IGNORECASE,
        ),
    )

    _WEAK_PATTERNS = (
        re.compile(
            r"\bremove\b",
            re.IGNORECASE,
        ),
        re.compile(
            r"\bdrop\b",
            re.IGNORECASE,
        ),
    )

    def evaluate(
        self,
        item: ReleaseItem,
    ) -> RuleResult:

        evidence: list[Evidence] = []

        text = item.text

        for pattern in self._STRONG_PATTERNS:

            if pattern.search(text):

                evidence.append(
                    Evidence(
                        score=0.75,
                        reason=(
                            f"Strong removal phrase matched: "
                            f"{pattern.pattern}"
                        ),
                    )
                )

        for pattern in self._WEAK_PATTERNS:

            if pattern.search(text):

                evidence.append(
                    Evidence(
                        score=0.30,
                        reason=(
                            f"Weak removal phrase matched: "
                            f"{pattern.pattern}"
                        ),
                    )
                )

        if item.heading:

            heading = item.heading.lower()

            if any(
                phrase in heading
                for phrase in (
                    "breaking change",
                    "breaking changes",
                    "removed",
                    "removals",
                    "deprecated",
                )
            ):

                evidence.append(
                    Evidence(
                        score=0.20,
                        reason="Removal-related section heading",
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
            matched=confidence >= 0.50,
            confidence=confidence,
            evidence=evidence,
        )