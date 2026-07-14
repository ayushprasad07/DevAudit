from app.clients.npm_clients import NpmClient
from app.entity.package_info import PackageInfo


class PackageIntelligence:

    @staticmethod
    def enrich(dependency):

        metadata = NpmClient.get_package(
            dependency.name
        )

        return PackageInfo(

            dependency=dependency,

            latest_version=metadata["latest_version"],

            description=metadata["description"],

            homepage=metadata["homepage"],

            repository=metadata["repository"],

            license=metadata["license"]
        )