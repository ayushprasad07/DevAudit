from packaging.version import Version


class VersionAnalyzer:

    @staticmethod
    def analyze(current_version: str, latest_version: str):

        current = Version(
            VersionAnalyzer._normalize(current_version)
        )

        latest = Version(latest_version)

        return {
            "is_outdated": current < latest,
            "update_type": VersionAnalyzer._get_update_type(
                current,
                latest
            )
        }

    @staticmethod
    def _normalize(version: str):

        prefixes = ["^", "~", ">=", "<=", ">", "<"]

        for prefix in prefixes:
            if version.startswith(prefix):
                return version[len(prefix):]

        return version

    @staticmethod
    def _get_update_type(current, latest):

        if current.major != latest.major:
            return "major"

        if current.minor != latest.minor:
            return "minor"

        if current.micro != latest.micro:
            return "patch"

        return "none"