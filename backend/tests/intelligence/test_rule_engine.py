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