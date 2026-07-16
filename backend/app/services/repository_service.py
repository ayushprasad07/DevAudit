from app.detectors.project_detector import ProjectDetector

from app.factory.dependency_scanner_factory import (
    DependecnyScannerFactory,
)

from app.intelligence.package_intelligence import (
    PackageIntelligence,
)

class RepositoryService:

    @staticmethod
    def analyse(repository_path):

        project_type = ProjectDetector.detect(repository_path)

        scanner = (
            DependecnyScannerFactory.get_scanner(
                project_type
            )
        )

        scan_result = scanner.scan(repository_path)

        packages = (
            PackageIntelligence.enrich_all(
                scan_result.dependencies
            )
        )

        return packages

