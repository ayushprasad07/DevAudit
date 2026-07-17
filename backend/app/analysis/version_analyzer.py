from packaging.version import InvalidVersion, Version


class VersionAnalyzer:

    @staticmethod
    def analyze(current_version: str, latest_version: str):

        current = VersionAnalyzer._parse(current_version)
        latest = VersionAnalyzer._parse(latest_version)

        if current is None or latest is None:
            return {
                "is_outdated": False,
                "update_type": "unknown"
            }

        return {
            "is_outdated": current < latest,
            "update_type": VersionAnalyzer._get_update_type(
                current,
                latest
            )
        }

    @staticmethod
    def _parse(version):

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
    def _get_update_type(current, latest):

        if current.major != latest.major:
            return "major"

        if current.minor != latest.minor:
            return "minor"

        if current.micro != latest.micro:
            return "patch"

        return "none"