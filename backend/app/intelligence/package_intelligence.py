from typing import List

from app.clients.registry_client_factory import RegistryClientFactory
from app.entity.dependency import Dependency
from app.entity.package_info import PackageInfo
from app.enums.project_types import ProjectType
from app.services.package_cache_service import PackageCacheService

from concurrent.futures import ThreadPoolExecutor


class PackageIntelligence:

    @classmethod
    def enrich_all(
        cls,
        project_type: ProjectType,
        dependencies: List[Dependency]
    ) -> List[PackageInfo]:

        with ThreadPoolExecutor(max_workers=8) as executor:
            packages = list(
                executor.map(
                    lambda dependency: cls._enrich(project_type, dependency),
                    dependencies
                )
            )

        return packages

    @staticmethod
    def _enrich(
        project_type: ProjectType,
        dependency: Dependency
    ) -> PackageInfo:


        cached = PackageCacheService.get(dependency.name)

        if cached:
            return PackageInfo(
                dependency=dependency,
                latest_version=cached.latest_version,
                description=cached.description,
                homepage=cached.homepage,
                repository=cached.repository,
                license=cached.license
            )

        registry = RegistryClientFactory.get_client(project_type)

        package = registry.get_package(dependency)

        latest_version = package["dist-tags"]["latest"]

        latest_data = package["versions"][latest_version]

        repository = latest_data.get("repository")

        print(package.get("description"))
        print(latest_data.get("description"))

        if isinstance(repository, dict):
            repository = repository.get("url")

        package_info = PackageInfo(
            dependency=dependency,
            latest_version=latest_version,
            description=(latest_data.get("description") or package.get("description") or "No description found"),
            homepage=(latest_data.get("homepage") or package.get("homepage") or "No homepage found"),
            repository=repository,
            license=(latest_data.get("license") or package.get("license") or "No license found")
        )

        PackageCacheService.save(
            dependency.name, package_info
        )

        return package_info