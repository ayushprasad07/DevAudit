from datetime import datetime

from app.intelligence.breaking_changes.models import (
    BreakingChangeCategory,
    BreakingChangeSeverity,
    RawRelease,
)
from app.intelligence.breaking_changes.parser.generic import (
    GenericReleaseParser,
)


def build_release() -> RawRelease:
    return RawRelease(
        version="16.2.10",
        title="Next.js 16.2.10",
        body="""
# What's Changed

## Breaking Changes

- Removed next/head.
- Deprecated Image component.
- Applications must update middleware.ts.
- Improved cache performance.

## Migration

Use the Metadata API instead of next/head.
""",
        published_at=datetime.now(),
        url="https://github.com/vercel/next.js/releases/tag/v16.2.10",
    )


def test_generic_release_parser():

    parser = GenericReleaseParser()

    parsed = parser.parse(build_release())

    assert parsed.release.version == "16.2.10"

    assert len(parsed.breaking_changes) == 5

    first = parsed.breaking_changes[0]

    assert first.category == BreakingChangeCategory.REMOVAL
    assert first.severity == BreakingChangeSeverity.BREAKING
    assert "next/head" in first.affected_apis

    second = parsed.breaking_changes[1]

    assert second.category == BreakingChangeCategory.DEPRECATION
    assert second.severity == BreakingChangeSeverity.MAJOR

    third = parsed.breaking_changes[2]

    assert third.category == BreakingChangeCategory.CONFIGURATION
    assert third.severity == BreakingChangeSeverity.BREAKING
    assert "middleware.ts" in third.affected_files

    fourth = parsed.breaking_changes[3]

    assert fourth.category == BreakingChangeCategory.PERFORMANCE

    fifth = parsed.breaking_changes[4]

    assert fifth.description.startswith("Use the Metadata API")