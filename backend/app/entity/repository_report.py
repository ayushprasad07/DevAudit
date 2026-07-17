from dataclasses import dataclass, field
from typing import List

from app.entity.package_info import PackageInfo
from app.entity.dependency_report import DependencyReport
from app.enums.project_types import ProjectType

@dataclass
class RepositoryReport:

    project_type: ProjectType

    packages: List[PackageInfo] = field(default_factory=list)

    dependency_count: int = 0

    outdated_count: int = 0

    dependency_reports: List[DependencyReport] = field(default_factory=list)