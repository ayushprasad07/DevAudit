from datetime import datetime, timezone
from pathlib import Path

from app.intelligence.breaking_changes.models import (
    RawRelease,
)
from app.intelligence.breaking_changes.parser.generic import (
    GenericReleaseParser,
)


def test_flask_release_pipeline():

    fixture = Path(
        "tests/parser/fixtures/flask/flask_v3.1.0.md"
    )

    markdown = fixture.read_text()

    release = RawRelease(
        version="3.1.0",
        title="Flask 3.1.0",
        body=markdown,
        published_at=datetime.now(timezone.utc),
        url=(
            "https://github.com/pallets/flask/"
            "releases/tag/3.1.0"
        ),
    )

    parser = GenericReleaseParser()

    parsed = parser.parse(release)

    assert parsed.release.version == "3.1.0"

    assert len(parsed.breaking_changes) > 0

    print("\n")
    print("=" * 80)
    print("DevAudit Intelligence Result")
    print("=" * 80)

    for index, change in enumerate(
        parsed.breaking_changes,
        start=1,
    ):

        print(f"\n[{index}]")
        print(f"Category   : {change.category.value}")
        print(f"Severity   : {change.severity.value}")
        print(f"Title      : {change.title}")
        print(f"Confidence : {change.confidence}")
        print("-" * 80)