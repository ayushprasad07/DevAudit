from datetime import datetime, timezone

from app.intelligence.breaking_changes.models import RawRelease
from app.intelligence.breaking_changes.parser.generic import (
    GenericReleaseParser,
)

from tests.parser.utils import load_fixture


def test_nextjs_release():

    markdown = load_fixture(
        "nextjs/nextjs_v16.0.0.md"
    )

    parser = GenericReleaseParser()

    release = RawRelease(
        version="16.0.0",
        title="Next.js 16.0.0",
        body=markdown,
        url="https://github.com/vercel/next.js/releases",
        published_at=datetime.now(timezone.utc),
    )

    parsed = parser.parse(release)

    print()

    print("=" * 80)

    print(f"Version: {parsed.release.version}")

    print("=" * 80)

    for change in parsed.breaking_changes:

        print()

        print(change.category.value)

        print(change.severity.value)

        print(change.title)

        print("Files:", change.affected_files)

        print("APIs :", change.affected_apis)

        print("-" * 80)