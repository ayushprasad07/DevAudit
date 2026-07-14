from app.enums.project_types import ProjectType
from app.scanners.node_scanner import NodeScanner

class DependecnyScannerFactory:

    @staticmethod
    def get_scanner(project_type):

       scanners = {
           ProjectType.NODE : NodeScanner()
       }

       scanner = scanners.get(project_type)

       if not scanner:
           raise ValueError(f"Scanner not found for project type {project_type}")

       return scanner