import asyncio

from app.intelligence.breaking_changes.models import VersionRange
from app.intelligence.breaking_changes.providers.github_releases_provider import (
    GitHubReleasesProvider,
)


async def main():
    provider = GitHubReleasesProvider()

    releases = await provider.get_releases(
        package_name="next",
        repository_url="https://github.com/vercel/next.js",
        version_range=VersionRange(
            current_version="15.5.5",
            target_version="16.2.10",
        ),
    )

    print(f"Found {len(releases)} releases\n")

    for release in releases:
        print("=" * 80)
        print(release.version)
        print(release.title)
        print(release.url)
        print(release.published_at)
        print(release.body[:300])
        print()


asyncio.run(main())