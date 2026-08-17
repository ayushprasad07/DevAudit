from datetime import datetime, timezone

from app.intelligence.breaking_changes.models import (
    BreakingChangeCategory,
    BreakingChangeSeverity,
    RawRelease,
)
from app.intelligence.breaking_changes.parser.generic import (
    GenericReleaseParser,
)


def test_generic_release_pipeline():

    release = RawRelease(
        version="5.0.0",
        title="Example 5.0.0",
        body="""
# Release 5.0.0

## Breaking Changes

- Removed the legacy authentication API.
- The old token system is no longer supported.

## Improvements

- Improved startup performance.
""",
        published_at=datetime.now(timezone.utc),
        url="https://example.com/releases/5.0.0",
    )

    parser = GenericReleaseParser()

    parsed = parser.parse(release)

    # --------------------------------
    # Release
    # --------------------------------

    assert parsed.release.version == "5.0.0"

    # --------------------------------
    # Breaking changes
    # --------------------------------

    assert len(parsed.breaking_changes) == 2

    first = parsed.breaking_changes[0]

    assert first.category == (
        BreakingChangeCategory.REMOVAL
    )

    assert first.severity == (
        BreakingChangeSeverity.BREAKING
    )

    assert first.version == "5.0.0"

    assert first.release_url == (
        "https://example.com/releases/5.0.0"
    )

    second = parsed.breaking_changes[1]

    assert second.category == (
        BreakingChangeCategory.REMOVAL
    )