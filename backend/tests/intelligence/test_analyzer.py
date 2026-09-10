from app.intelligence.breaking_changes.analyzer import (
    IntelligenceAnalyzer,
)
from app.intelligence.breaking_changes.models import (
    BreakingChangeCategory,
)
from app.intelligence.breaking_changes.parser.models import ReleaseItem


def make_item(text: str) -> ReleaseItem:
    return ReleaseItem(
        text=text,
        heading=None,
        heading_level=0,
        source_type="paragraph",
    )


def test_high_confidence_change_becomes_breaking_change():

    analyzer = IntelligenceAnalyzer()

    result = analyzer.analyze(
        items=[
            make_item("Drop support for Python 3.8.")
        ],
        version="3.1.0",
        release_url="https://example.com/release",
    )

    assert len(result.breaking_changes) == 1

    change = result.breaking_changes[0]

    assert change.category == BreakingChangeCategory.REMOVAL
    assert change.confidence >= 0.8


def test_low_confidence_change_becomes_fallback_candidate():

    analyzer = IntelligenceAnalyzer()

    result = analyzer.analyze(
        items=[
            make_item(
                "This API will be removed in a future release."
            )
        ],
        version="3.1.0",
        release_url="https://example.com/release",
    )

    assert len(result.breaking_changes) == 0

    assert len(result.fallback_candidates) == 1

    candidate = result.fallback_candidates[0]

    assert candidate.level.value == "low"
    assert candidate.evaluation.result.confidence == 0.30

def test_multiple_rules_are_processed():

    analyzer = IntelligenceAnalyzer()

    result = analyzer.analyze(
        items=[
            make_item(
                "The old API is deprecated and will be removed."
            )
        ],
        version="3.1.0",
        release_url="https://example.com/release",
    )

    categories = {
        change.category
        for change in result.breaking_changes
    }

    assert BreakingChangeCategory.DEPRECATION in categories
    assert BreakingChangeCategory.REMOVAL in categories