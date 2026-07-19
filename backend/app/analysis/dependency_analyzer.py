from typing import List

from app.analysis.license_analyzer import LicenseAnalyzer
from app.analysis.version_analyzer import VersionAnalyzer
from app.entity.dependency_report import DependencyReport
from app.entity.repository_report import RepositoryReport


class DependencyAnalyzer:

    @classmethod
    def analyze(
        cls,
        repository_report: RepositoryReport
    ) -> List[DependencyReport]:

        reports = []

        for package in repository_report.packages:

            reports.append(
                cls._analyze_package(package)
            )

        return reports

    @staticmethod
    def _analyze_package(package) -> DependencyReport:

        version_analysis = VersionAnalyzer.analyze(
            package.dependency.current_version,
            package.latest_version
        )

        return DependencyReport(
            package=package,
            is_outdated=version_analysis.is_outdated,
            update_type=version_analysis.update_type,
            license_risk=LicenseAnalyzer.analyze(
                package.license
            ),
            confidence=1.0
        )