from dataclasses import dataclass

from app.entity.dependency_report import DependencyReport


@dataclass
class MigrationReport:

    dependency_report: DependencyReport

    affected_file: str

    original_code: str

    updated_code: str

    explanation: str

    confidence: float