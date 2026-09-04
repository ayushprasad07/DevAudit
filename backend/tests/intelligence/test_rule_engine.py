from app.intelligence.breaking_changes.models import (
    BreakingChangeCategory,
    BreakingChangeSeverity,
)
from app.intelligence.breaking_changes.parser.models import (
    ReleaseItem,
)
from app.intelligence.breaking_changes.rule_engine import (
    RuleEngine,
)




def test_rule_engine_detects_removal():

    item = ReleaseItem(
        text="Removed the legacy authentication API.",
        heading="Breaking Changes",
        heading_level=2,
        source_type="list_item",
    )

    engine = RuleEngine()

    results = engine.evaluate(
        item=item,
        version="5.0.0",
        release_url="https://example.com/release",
    )

    assert len(results) == 1

    change = results[0]

    assert change.category == (
        BreakingChangeCategory.REMOVAL
    )

    assert change.severity == (
        BreakingChangeSeverity.BREAKING
    )

    assert change.version == "5.0.0"

    assert change.release_url == (
        "https://example.com/release"
    )


def make_item(text: str) -> ReleaseItem:
    return ReleaseItem(
        text=text,
        heading=None,
        heading_level=0,
        source_type="paragraph",
    )


def test_multiple_rules_can_evaluate_same_item():
    engine = RuleEngine()

    item = make_item(
        "The old API is deprecated and will be removed in a future release."
    )

    changes = engine.evaluate(
        item=item,
        version="3.0.0",
        release_url="https://example.com/release",
    )

    categories = {
        change.category
        for change in changes
    }

    assert BreakingChangeCategory.DEPRECATION in categories
    assert BreakingChangeCategory.REMOVAL in categories