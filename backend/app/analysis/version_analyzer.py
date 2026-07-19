from packaging.version import Version, InvalidVersion

from app.entity.version_analysis import VersionAnalysis
from app.enums.update_type import UpdateType


class VersionAnalyzer:

    @staticmethod
    def analyze(current_version: str, latest_version: str) -> VersionAnalysis:

        current = VersionAnalyzer._parse(current_version)
        latest = VersionAnalyzer._parse(latest_version)

        if current is None or latest is None:
            return VersionAnalysis(
                is_outdated=False,
                update_type=UpdateType.UNKNOWN
            )

        return VersionAnalysis(
            is_outdated=current < latest,
            update_type=VersionAnalyzer._get_update_type(
                current,
                latest
            )
        )

    @staticmethod
    def _parse(version: str):

        version = version.strip()

        prefixes = [
            "^",
            "~",
            ">=",
            "<=",
            ">",
            "<",
            "="
        ]

        for prefix in prefixes:
            if version.startswith(prefix):
                version = version[len(prefix):]

        try:
            return Version(version)

        except InvalidVersion:
            return None

    @staticmethod
    def _get_update_type(
        current: Version,
        latest: Version
    ) -> UpdateType:

        if current.major != latest.major:
            return UpdateType.MAJOR

        if current.minor != latest.minor:
            return UpdateType.MINOR

        if current.micro != latest.micro:
            return UpdateType.PATCH

        return UpdateType.NONE