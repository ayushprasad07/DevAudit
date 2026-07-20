from app.constants.ecosystem import Ecosystem
from app.enums.project_types import ProjectType

class EcosystemMapper:

    MAPPING = {
        ProjectType.NODE : Ecosystem.NPM,
        ProjectType.PYTHON : Ecosystem.PYPI,
        ProjectType.JAVA : Ecosystem.MAVEN,
        ProjectType.GO : Ecosystem.GO,
        ProjectType.RUST : Ecosystem.CRATES
    }

    @classmethod
    def get_ecosystem(cls, project_type):

        ecosystem = cls.MAPPING.get(project_type)

        if ecosystem is None:
            raise ValueError(f"Ecosystem not found for project type {project_type}")

        return ecosystem