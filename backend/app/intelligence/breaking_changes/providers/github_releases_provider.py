from __future__ import annotations

import logging
from datetime import datetime
from urllib.parse import urlparse

import httpx

from app.intelligence.breaking_changes.models import (
    RawRelease,
    VersionRange,
)
from app.intelligence.breaking_changes.providers.base_provider import (
    BaseBreakingChangeProvider,
)
from app.utils.version import (
    is_valid_version,
    normalize_version,
)
from app.intelligence.breaking_changes.migration_filter import filter_relevant_releases

logger = logging.getLogger(__name__)


class GitHubReleasesProvider(BaseBreakingChangeProvider):

    GITHUB_API = "https://api.github.com"

    def __init__(self, github_token: str | None = None):

        self.github_token = github_token
        # self.client = client

    async def get_releases(
            self,
            package_name: str,
            version_range: VersionRange,
            repository_url: str | None = None,
    ) -> list[RawRelease]:
        
        if repository_url is None:
            logger.warning(
                "Repository url missing for %s", package_name
            )
            return []
        
        repository = self.extract_repository(repository_url)

        try:

            releases = await self.fetch_release(repository)
        
        except httpx.HTTPError:
            logger.exception(
                "Failed to fetch releases"
            )
            return []

        raw_releases=[]
        
        for release in releases:
            version = normalize_version(release["tag_name"])

            if not is_valid_version(version):
                logger.debug("Skipping prerelease: %s", version)
                continue

            raw_releases.append(self._to_raw_release(release))

        return filter_relevant_releases(
            raw_releases,
            version_range.current_version,
            version_range.target_version,
        )

            

    def extract_repository(self, repository_url : str)->str:

        parse = urlparse(repository_url)

        path = parse.path.strip('/')

        if path.endswith('.git'):
            path = path[:-4]

        return path
    
    def _headers(self) -> dict[str,str]:

        headers = {
            "Accept": "application/vnd.github+json"
        }

        if self.github_token:
            headers["Authorization"] = (
                f"Bearer {self.github_token}"
            )

        return headers
    
    async def fetch_release(self, repository : str) -> list[dict]:

        url = (
            f"{self.GITHUB_API}"
            f"/repos/{repository}/releases"
        )

        async with httpx.AsyncClient(timeout= 30) as client:
            response = await client.get(
                url,
                headers=self._headers()
            )

            response.raise_for_status()

            return response.json()
        
    def _to_raw_release(
        self,
        release: dict,
    ) -> RawRelease:

        return RawRelease(
            version=normalize_version(
                release["tag_name"]
            ),
            title=release.get("name", ""),
            body=release.get("body", ""),
            published_at=datetime.fromisoformat(
                release["published_at"].replace(
                    "Z",
                    "+00:00",
                )
            ),
            url=release["html_url"],
        )
    
