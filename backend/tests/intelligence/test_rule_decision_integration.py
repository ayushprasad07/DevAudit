from app.intelligence.breaking_changes.decision.engine import (
    DecisionEngine,
    DecisionLevel,
    RuleEvaluation,
)
from app.intelligence.breaking_changes.parser.models import ReleaseItem
from app.intelligence.breaking_changes.rules.deprecation import DeprecationRule
from app.intelligence.breaking_changes.rules.removal import RemovalRule


def make_item(text: str) -> ReleaseItem:
    return ReleaseItem(
        text=text,
        heading=None,
        heading_level=0,
        source_type="paragraph",
    )


def test_high_confidence_rule_reaches_decision_engine():
    item = make_item(
        "Drop support for Python 3.8."
    )

    rule = RemovalRule()
    result = rule.evaluate(item)

    evaluation = RuleEvaluation(
        rule=rule,
        result=result,
    )

    decision_engine = DecisionEngine()

    decision = decision_engine.classify(evaluation)

    assert decision == DecisionLevel.HIGH


def test_low_confidence_rule_reaches_decision_engine():
    item = make_item(
        "This API will be removed in a future release."
    )

    rule = DeprecationRule()
    result = rule.evaluate(item)

    evaluation = RuleEvaluation(
        rule=rule,
        result=result,
    )

    decision_engine = DecisionEngine()

    decision = decision_engine.classify(evaluation)

    assert decision == DecisionLevel.LOW