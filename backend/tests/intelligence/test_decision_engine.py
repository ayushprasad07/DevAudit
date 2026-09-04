from app.intelligence.breaking_changes.decision.engine import (
    DecisionEngine,
    DecisionLevel,
    RuleEvaluation,
)
from app.intelligence.breaking_changes.rules.deprecation import (
    DeprecationRule,
)
from app.intelligence.breaking_changes.rules.evidence import RuleResult


def make_evaluation(confidence: float) -> RuleEvaluation:
    return RuleEvaluation(
        rule=DeprecationRule(),
        result=RuleResult(
            matched=confidence >= 0.5,
            confidence=confidence,
        ),
    )


def test_high_confidence():
    engine = DecisionEngine()

    evaluation = make_evaluation(0.90)

    assert engine.classify(evaluation) == DecisionLevel.HIGH


def test_medium_confidence():
    engine = DecisionEngine()

    evaluation = make_evaluation(0.60)

    assert engine.classify(evaluation) == DecisionLevel.MEDIUM


def test_low_confidence():
    engine = DecisionEngine()

    evaluation = make_evaluation(0.30)

    assert engine.classify(evaluation) == DecisionLevel.LOW


def test_no_confidence():
    engine = DecisionEngine()

    evaluation = make_evaluation(0.0)

    assert engine.classify(evaluation) == DecisionLevel.NONE