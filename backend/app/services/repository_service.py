from app.detectors.project_detector import ProjectDetector
from urllib.parse import urlparse

from app.entity.repository_report import RepositoryReport

from app.factory.dependency_scanner_factory import (
    DependencyScannerFactory,
)

from app.intelligence.package_intelligence import (
    PackageIntelligence,
)

from app.analysis.dependency_analyzer import DependencyAnalyzer

from app.repository.repository_manager import RepositoryManager


class RepositoryService:

    @classmethod
    def analyze_repository(cls, repository_url):
        
        path = urlparse(repository_url).path

        parts = path.strip("/").replace(".git", "").split("/")

        owner = parts[0]
        repository = parts[1]

        local_path = RepositoryManager.clone_repository(
            repository_url,
            owner,
            repository
        )

        try :
            return cls.analyze(local_path)
        finally:
            RepositoryManager.delete_repository(
                owner,
                repository
            )

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

        repository_report =  RepositoryReport(
            project_type=project_type,
            packages=packages,
            dependency_count=len(packages),
            outdated_count=0
        )

        dependency_reports = DependencyAnalyzer.analyze(repository_report)

        repository_report.outdated_count = sum(
            1
            for report in dependency_reports
            if report.is_outdated
        )

        return {
            "repository" : repository_report,
            "dependencies" : dependency_reports
        }