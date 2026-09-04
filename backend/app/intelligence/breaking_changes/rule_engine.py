from __future__ import annotations

from app.intelligence.breaking_changes.models import (
    BreakingChange,
    BreakingChangeSource,
)
from app.intelligence.breaking_changes.parser.models import (
    ReleaseItem,
)

from .rules.base import BaseRule
from .rules.removal import RemovalRule
from .rules.deprecation import DeprecationRule


class RuleEngine:

    def __init__(
        self,
        rules: list[BaseRule] | None = None,
    ) -> None:

        if rules is None:
            self._rules = [
                RemovalRule(),
                DeprecationRule(),
            ]
        else:
            self._rules = rules

    def evaluate(
        self,
        item: ReleaseItem,
        version: str,
        release_url: str,
    ) -> list[BreakingChange]:

        changes: list[BreakingChange] = []

        for rule in self._rules:

            result = rule.evaluate(item)

            if not result.matched:
                continue

            changes.append(
                BreakingChange(
                    version=version,
                    title=item.text[:80],
                    description=item.text,
                    category=rule.category,
                    severity=rule.severity,
                    source=BreakingChangeSource.GITHUB_RELEASE,
                    release_url=release_url,
                    confidence=result.confidence,
                )
            )

        return changes