from datetime import datetime, timedelta

from app.entity.package_info import PackageInfo
from app.models.package_cache_model import PackageCacheModel


class PackageCacheService:

    CACHE_DURATION = timedelta(hours=24)

    @staticmethod
    def get(package_name: str):

        package = PackageCacheModel.find_by_name(package_name)

        if not package:
            return None

        if package["expires_at"] < datetime.utcnow():
            return None
        
        print(f"✅ Cache Hit : {package_name}")

        return PackageInfo(
            dependency=None,
            latest_version=package["latest_version"],
            description=package.get("description"),
            homepage=package.get("homepage"),
            repository=package.get("repository"),
            license=package.get("license")
        )

    @staticmethod
    def save(package_name: str, package_info: PackageInfo):

        print(f"💾 Cached : {package_name}")

        document = {
            "name": package_name,
            "latest_version": package_info.latest_version,
            "description": package_info.description,
            "homepage": package_info.homepage,
            "repository": package_info.repository,
            "license": package_info.license,
            "last_checked": datetime.utcnow(),
            "expires_at": datetime.utcnow()
            + PackageCacheService.CACHE_DURATION
        }

        PackageCacheModel.update(package_name, document)