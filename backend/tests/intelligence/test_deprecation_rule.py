from app.intelligence.breaking_changes.models import (
    BreakingChangeCategory,
    BreakingChangeSeverity,
)

from app.intelligence.breaking_changes.parser.models import (
    ReleaseItem,
)

from app.intelligence.breaking_changes.rules.deprecation import (
    DeprecationRule,
)


def make_item(
    text: str,
    heading: str | None = None,
) -> ReleaseItem:

    return ReleaseItem(
        text=text,
        heading=heading,
        heading_level=2 if heading else 0,
        source_type="paragraph",
    )


def test_explicit_deprecation():

    rule = DeprecationRule()

    result = rule.evaluate(
        make_item(
            "The legacy authentication API is deprecated."
        )
    )

    assert result.matched is True
    assert result.confidence >= 0.5


def test_deprecation_with_replacement():

    rule = DeprecationRule()

    result = rule.evaluate(
        make_item(
            "The old authentication API is deprecated. "
            "Use the new authentication API instead."
        )
    )

    assert result.matched is True
    assert result.confidence >= 0.5


def test_future_removal_warning():
    rule = DeprecationRule()

    result = rule.evaluate(
        make_item(
            "This API will be removed in a future release."
        )
    )

    assert result.matched is False
    assert result.confidence == 0.30


def test_unrelated_item():

    rule = DeprecationRule()

    result = rule.evaluate(
        make_item(
            "Improved application startup performance."
        )
    )

    assert result.matched is False


def test_removal_is_not_automatically_deprecation():

    rule = DeprecationRule()

    result = rule.evaluate(
        make_item(
            "The legacy API was removed."
        )
    )

    assert result.matched is False