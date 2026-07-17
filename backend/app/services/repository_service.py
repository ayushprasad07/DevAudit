from app.detectors.project_detector import ProjectDetector

from app.entity.repository_report import RepositoryReport

from app.factory.dependency_scanner_factory import (
    DependencyScannerFactory,
)

from app.intelligence.package_intelligence import (
    PackageIntelligence,
)


class RepositoryService:

    @staticmethod
    def analyze(repository_path):

        project_type = ProjectDetector.detect(
            repository_path
        )

        scanner = DependencyScannerFactory.get_scanner(
            project_type
        )

        scan_result = scanner.scan(
            repository_path
        )

        packages = PackageIntelligence.enrich_all(
            project_type,
            scan_result.dependencies
        )

        return RepositoryReport(
            project_type=project_type,
            packages=packages,
            dependency_count=len(packages),
            outdated_count=0
        )