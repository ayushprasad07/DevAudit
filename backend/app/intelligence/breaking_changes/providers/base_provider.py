from __future__ import annotations

from abc import ABC, abstractmethod

from app.intelligence.breaking_changes.models import (
    RawRelease,
    VersionRange,
)


class BaseBreakingChangeProvider(ABC):
    """
    Base interface for all breaking change providers.

    A provider is responsible for fetching raw release information
    from a specific source (GitHub Releases, CHANGELOG, Migration Guide,
    Documentation, etc.).

    Providers DO NOT parse release notes into breaking changes.
    They only return RawRelease objects.
    """

    @abstractmethod
    async def get_releases(
        self,
        package_name: str,
        version_range: VersionRange,
        repository_url: str | None = None,
    ) -> list[RawRelease]:
        """
        Fetch releases for the given package within the requested version range.

        Args:
            package_name:
                Name of the package (e.g. "next", "axios").

            version_range:
                Current and target version.

            repository_url:
                Optional GitHub repository URL if already known.

        Returns:
            List of RawRelease objects.
        """
        raise NotImplementedError