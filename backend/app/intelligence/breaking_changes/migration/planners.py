from __future__ import annotations

from app.intelligence.breaking_changes.models import RawRelease
from app.utils.version import parse_version

from .models import MigrationPath, MigrationStep


class MigrationPlanner:
    """
    Builds the migration path between two versions.
    """

    def build_path(
        self,
        releases: list[RawRelease],
        current_version: str,
        target_version: str,
    ) -> MigrationPath:
        """
        Build the ordered migration path.

        Parameters
        ----------
        releases:
            Stable releases already filtered to the upgrade window.
        current_version:
            User's installed version.
        target_version:
            Desired version.
        """
        sorted_releases = self._sort_releases(releases)
        milestones = self._find_major_milestones(sorted_releases)
        steps = self._build_steps(milestones, current_version)

        return MigrationPath(
            current_version=current_version,
            target_version=target_version,
            steps=steps,
        )

    def _sort_releases(
        self,
        releases: list[RawRelease],
    ) -> list[RawRelease]:
        # Don't mutate the caller's list — return a new sorted one.
        return sorted(
            releases,
            key=lambda release: parse_version(release.version),
        )

    def _find_major_milestones(
        self,
        releases: list[RawRelease],
    ) -> list[RawRelease]:
        """
        Assumes `releases` is already sorted ascending (call _sort_releases first).
        Picks the first release of each new major version, plus always keeps
        the final release in the list (the actual target).
        """
        if not releases:
            return []

        milestones: list[RawRelease] = [releases[0]]

        for release in releases[1:]:
            current_major = release.version.split(".")[0]
            last_major = milestones[-1].version.split(".")[0]

            if current_major != last_major:
                milestones.append(release)

        # Always ensure the final/target release is included, even if it
        # shares a major with the last milestone (e.g. 16.0.0 -> 16.2.10).
        if milestones[-1].version != releases[-1].version:
            milestones.append(releases[-1])

        return milestones

    def _build_steps(
        self,
        milestones: list[RawRelease],
        current_version: str,
    ) -> list[MigrationStep]:
        """
        Turns a list of milestone releases into ordered (from -> to) steps,
        starting from the user's current version.
        """
        if not milestones:
            return []

        steps: list[MigrationStep] = []
        previous_version = current_version

        for milestone in milestones:
            steps.append(
                MigrationStep(
                    from_version=previous_version,
                    to_version=milestone.version,
                )
            )
            previous_version = milestone.version

        return steps