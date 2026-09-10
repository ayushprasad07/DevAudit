from __future__ import annotations

from dataclasses import dataclass, field

from app.intelligence.breaking_changes.decision.engine import (
    Decision,
    DecisionEngine,
    DecisionLevel,
)
from app.intelligence.breaking_changes.models import (
    BreakingChange,
    BreakingChangeSource,
)
from app.intelligence.breaking_changes.parser.models import ReleaseItem
from app.intelligence.breaking_changes.rule_engine import RuleEngine

@dataclass(slots=True)
class AnalysisResult:
    breaking_changes: list[BreakingChange] = field(default_factory=list)
    fallback_candidates: list[Decision] = field(default_factory=list)

class IntelligenceAnalyzer:

    def __init__(
        self,
        rule_engine: RuleEngine | None = None,
        decision_engine: DecisionEngine | None = None,
    ) -> None:

        self._rule_engine = rule_engine or RuleEngine()
        self._decision_engine = decision_engine or DecisionEngine()

    def analyze(
            self,
            items : list[ReleaseItem],
            version : str,
            release_url : str
    ) -> AnalysisResult:

        result = AnalysisResult()

        for item in items:

            evaluations = self._rule_engine.evaluate_rules(item)

            for evaluation in evaluations:

                decision = self._decision_engine.decide(evaluation)

                if (decision.level in {
                    DecisionLevel.HIGH,
                    DecisionLevel.MEDIUM,
                }) :

                    result.breaking_changes.append(
                        self._create_breaking_change(
                            item=item,
                            decision=decision,
                            version=version,
                            release_url=release_url,
                        )
                    )

                elif (decision.level == DecisionLevel.LOW):
                    result.fallback_candidates.append(decision)

        return result

    def _create_breaking_change(
            self,
            item: ReleaseItem,
            decision: Decision,
            version: str,
            release_url: str,
    ) -> BreakingChange:

        rule = decision.evaluation.rule
        rule_result = decision.evaluation.result

        return BreakingChange(
            version=version,
            title=item.text[:80],
            description=item.text,
            category=rule.category,
            severity=rule.severity,
            source=BreakingChangeSource.GITHUB_RELEASE,
            release_url=release_url,
            confidence=rule_result.confidence,
        )

