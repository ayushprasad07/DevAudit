HIGH_RISK_LICENSES = {

    "GPL-3.0",

    "AGPL-3.0",

    "LGPL-3.0"
}


class LicenseAnalyzer:

    @staticmethod
    def analyze(license_name : str) -> str:

        if not license_name:

            return "unknown"

        if license_name in HIGH_RISK_LICENSES:

            return "high"

        return "low"