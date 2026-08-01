from datetime import datetime, timezone

from app.intelligence.breaking_changes.models import (
    RawRelease,
    BreakingChangeCategory,
)
from app.intelligence.breaking_changes.parser.generic import (
    GenericReleaseParser,
)

from tests.parser.utils import load_fixture


def test_flask_3_1_release():

    markdown = load_fixture(
        "flask/flask_v3.1.0.md"
    )

    release = RawRelease(
        version="3.1.0",
        title="Flask 3.1.0",
        body=markdown,
        url="https://github.com/pallets/flask/releases/tag/3.1.0",
        published_at=datetime.now(timezone.utc),
    )

    parser = GenericReleaseParser()

    parsed = parser.parse(release)

    print("\n")
    print("=" * 80)
    print(f"Version : {parsed.release.version}")
    print("=" * 80)

    for index, change in enumerate(parsed.breaking_changes, start=1):

        print(f"\n[{index}]")
        print(f"Category   : {change.category.value}")
        print(f"Severity   : {change.severity.value}")
        print(f"Title      : {change.title}")
        print(f"Files      : {change.affected_files}")
        print(f"APIs       : {change.affected_apis}")
        print(f"Confidence : {change.confidence}")

        print("-" * 80)

    #
    # Basic sanity checks
    #

    assert parsed.release.version == "3.1.0"

    assert len(parsed.breaking_changes) > 0

    #
    # We should detect at least one configuration-related change.
    #

    assert any(
        change.category == BreakingChangeCategory.CONFIGURATION
        for change in parsed.breaking_changes
    )