from app.intelligence.breaking_changes.parser.models import (
    ReleaseItem,
)
from app.intelligence.breaking_changes.rules.removal import (
    RemovalRule,
)


def test_explicit_removal():

    item = ReleaseItem(
        text="Removed the legacy authentication API.",
        heading="Breaking Changes",
        heading_level=2,
        source_type="list_item",
    )

    result = RemovalRule().evaluate(item)

    assert result.matched is True
    assert result.confidence >= 0.5
    assert len(result.evidence) > 0


def test_semantic_removal_phrase():

    item = ReleaseItem(
        text="The legacy authentication API has been retired.",
        heading="Migration",
        heading_level=2,
        source_type="paragraph",
    )

    result = RemovalRule().evaluate(item)

    assert result.matched is True


def test_unrelated_item():

    item = ReleaseItem(
        text="Improved startup performance.",
        heading="Improvements",
        heading_level=2,
        source_type="list_item",
    )

    result = RemovalRule().evaluate(item)

    assert result.matched is False

def test_removal_rule_does_not_overreact_to_general_statement():

    item = ReleaseItem(
        text=(
            "A feature release may include new features, "
            "remove previously deprecated code."
        ),
        heading="Introduction",
        heading_level=0,
        source_type="paragraph",
    )

    result = RemovalRule().evaluate(item)

    assert result.confidence < 0.5
    assert result.matched is False