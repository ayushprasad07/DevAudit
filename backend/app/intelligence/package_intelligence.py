from typing import List

from app.entity.dependency import Dependency
from app.entity.package_info import PackageInfo
from app.clients.npm_clients import NpmClient

class PackageIntelligence:

    @classmethod
    def enrich_all(cls, dependencies : List[Dependency]) -> List[PackageInfo]:

        package_infos = []

        for dependency in dependencies:

            package_infos.append(
                cls._enrich(dependency)
            )

        return package_infos
    
    @staticmethod
    def _enrich(dependency : Dependency) -> PackageInfo:

        package = NpmClient.get_package(dependency.name)

        latest_version = package["dist-tags"]["latest"]

        latest_data = package[latest_version]['version']

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