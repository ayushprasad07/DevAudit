from pathlib import Path

from typing import List


from app.entity.dependency import Dependency
from app.utils.file_reader import FileReader
from app.entity.scan_result import ScanResult
from app.enums.project_types import ProjectType
from app.scanners.base_scanner import BaseScanner

class NodeScanner(BaseScanner):

    DEPENDENCY_FILE = "package.json"

    def scan(self, repository_path):
        
        package_file = Path(repository_path) / self.DEPENDENCY_FILE

        if not FileReader.exists(package_file):
            raise FileNotFoundError("Package file not found")
        
        package_json = FileReader.read_json(package_file)

        dependencies = self.__extract_dependencies__(package_json)

        return ScanResult(
            project_type = ProjectType.NODE,
            dependecy_file = str(package_file),
            dependencies = dependencies
        )
    
    def __extract_dependencies__(self, package_json) -> List[Dependency]:

        dependencies = []

        all_dependencies = {
            **package_json.get("dependencies",{}),
            **package_json.get("devDependencies",{}),
        }

        for name, version in all_dependencies.items():

            dependencies.append(
                Dependency(
                    name=name,
                    current_version=version
                )
            )

        return dependencies