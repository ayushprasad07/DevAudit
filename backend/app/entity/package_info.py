from dataclasses import dataclass

from app.entity.dependency import Dependency

@dataclass
class PackageInfo:
    
    dependency: Dependency

    latest_version: str

    description: str

    homepage: str

    repository: str

    license: str