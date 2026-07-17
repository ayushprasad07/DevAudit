from typing import List

from app.clients.registry_client_factory import RegistryClientFactory
from app.entity.dependency import Dependency
from app.entity.package_info import PackageInfo
from app.enums.project_types import ProjectType


class PackageIntelligence:

    @classmethod
    def enrich_all(
        cls,
        project_type: ProjectType,
        dependencies: List[Dependency]
    ) -> List[PackageInfo]:

        return [
            cls._enrich(project_type, dependency)
            for dependency in dependencies
        ]

    @staticmethod
    def _enrich(
        project_type: ProjectType,
        dependency: Dependency
    ) -> PackageInfo:

        registry = RegistryClientFactory.get_client(project_type)

        package = registry.get_package(dependency)

        latest_version = package["dist-tags"]["latest"]

        latest_data = package["versions"][latest_version]

        repository = latest_data.get("repository")

        if isinstance(repository, dict):
            repository = repository.get("url")

        return PackageInfo(
            dependency=dependency,
            latest_version=latest_version,
            description=latest_data.get("description"),
            homepage=latest_data.get("homepage"),
            repository=repository,
            license=latest_data.get("license")
        )