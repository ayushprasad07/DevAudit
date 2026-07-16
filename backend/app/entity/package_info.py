from dataclasses import dataclass
from typing import Optional

from app.entity.dependency import Dependency


@dataclass
class PackageInfo:

    dependency: Dependency

    latest_version: str

    license: Optional[str]

    description: Optional[str]

    homepage: Optional[str]

    repository: Optional[str]