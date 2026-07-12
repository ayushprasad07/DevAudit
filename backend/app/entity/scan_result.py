from dataclasses import dataclass , field
from typing import List

from app.enums.project_types import ProjectType

@dataclass
class ScanResult:

    project_type : ProjectType

    dependecy_list : str

    dependencies : List[dict]  = field (default_factory=list)