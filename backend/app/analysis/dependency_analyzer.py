from typing import List

from app.analysis.license_analyzer import LicenseAnalyzer
from app.analysis.version_analyzer import VersionAnalyzer
from app.entity.dependency_report import DependencyReport
from app.entity.repository_report import RepositoryReport
from app.services.vulnerability_service import VulnerabilityService

from concurrent.futures import ThreadPoolExecutor


class DependencyAnalyzer:

    @classmethod
    def analyze(
        cls,
        repository_report: RepositoryReport
    ) -> List[DependencyReport]:

        with ThreadPoolExecutor(max_workers=8) as executor:

            reports = list(
                executor.map(
                    lambda package : cls._analyze_package(
                        package,
                        repository_report.project_type
                    ),
                    repository_report.packages
                )
            )

            return reports

    @staticmethod
    def _analyze_package(package, project_type) -> DependencyReport:

        version_analysis = VersionAnalyzer.analyze(
            package.dependency.current_version,
            package.latest_version
        )

        vulnerabilities = VulnerabilityService.get_vulnerabilities(
            project_type,
            package.dependency
        )

        return DependencyReport(
            package=package,
            is_outdated=version_analysis.is_outdated,
            update_type=version_analysis.update_type,
            license_risk=LicenseAnalyzer.analyze(
                package.license
            ),
            vulnerabilities=vulnerabilities,
            confidence=1.0
        )