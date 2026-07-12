from pathlib import Path

from app.enums.project_types import ProjectType


class ProjectDetector:

    PROJECT_FILES = {

        "package.json": ProjectType.NODE,

        "requirements.txt": ProjectType.PYTHON,

        "pom.xml": ProjectType.JAVA,

        "pubspec.yaml": ProjectType.FLUTTER,

        "go.mod": ProjectType.GO,

        "Cargo.toml": ProjectType.RUST
    }

    @classmethod
    def detect(cls, repository_path):

        repository_path = Path(repository_path)

        for file_name, project_type in cls.PROJECT_FILES.items():

            if (repository_path / file_name).exists():

                return project_type

        return ProjectType.UNKNOWN