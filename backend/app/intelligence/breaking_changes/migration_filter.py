from __future__ import annotations

from app.intelligence.breaking_changes.models import RawRelease
from app.utils.version import parse_version

def filter_relevant_releases(
    releases: list[RawRelease],
    current_version: str,
    target_version: str,
) -> list[RawRelease]:

    current = parse_version(current_version)
    target = parse_version(target_version)

    relevant : list[RawRelease] = []

    for release in releases:

        version = parse_version(release.version)

        if version <= current or version > target:
            continue

        if (
            current.major != target.major and 
            version.major == current.major
        ):
            continue

        relevant.append(release)

    return sorted(
        relevant,
        key=lambda release: parse_version(release.version),
    )
