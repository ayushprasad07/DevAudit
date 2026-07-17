from app.analysis.license_analyzer import LicenseAnalyzer
from app.analysis.version_analyzer import VersionAnalyzer
from app.entity.dependency_report import DependencyReport


class DependencyAnalyzer:

    @staticmethod
    def analyze(repository_report):

        reports = []

        outdated = 0

        for package in repository_report.packages:

            version = VersionAnalyzer.analyze(
                package.dependency.current_version,
                package.latest_version
            )

            report = DependencyReport(
                package=package,
                is_outdated=version["is_outdated"],
                update_type=version["update_type"],
                license_risk=LicenseAnalyzer.analyze(
                    package.license
                ),
                confidence=1.0
            )

            if report.is_outdated:
                outdated += 1

            reports.append(report)

        repository_report.dependency_reports = reports
        repository_report.outdated_count = outdated

        return repository_report