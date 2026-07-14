from dataclasses import dataclass , field
from typing import List

from app.enums.project_types import ProjectType

from app.entity.dependency import Dependency

@dataclass
class ScanResult:

    project_type : ProjectType

    dependecy_list : str

    dependencies : List[Dependency]  = field (default_factory=list)