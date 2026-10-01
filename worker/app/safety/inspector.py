from pathlib import Path

from .models import (SafetyAssessment, SafetyFinding, SafetyStatus, SafetyMetadata, FindingSeverity)

from .rules import inspect_package_json

# class SafetyInspector:
#     def inspect(self, repository_path : Path) -> SafetyAssessment:
#         raise NotImplementedError


class SafetyInspector:

    def inspect(self, repository_path : Path) -> SafetyAssessment:

        if not repository_path.exists():

            return SafetyAssessment(
                status  = SafetyStatus.BLOCK,
                findings = [SafetyFinding(
                    rule     = "repository_not_found",
                    severity = FindingSeverity.CRITICAL,
                    message  = f"Repository not found: {repository_path}",
                )]
            )

        if not repository_path.is_dir():
            return SafetyAssessment(
                status = SafetyStatus.BLOCK,
                findings = [SafetyFinding(
                    rule     = "invalid_repository_path",
                    severity = FindingSeverity.CRITICAL,
                    message  = f"Repository path is not a directory: {repository_path}",
                )]
            )

        file_count = 0 
        total_size = 0

        for path in repository_path.rglob("*"):
            if path.is_file():
                file_count += 1
                try:
                    total_size += path.stat().st_size
                except OSError:
                    pass

        findings : list[SafetyFinding] = []

        package_json = repository_path/"package.json"

        if package_json.is_file():
            findings.extend(inspect_package_json(package_json))

        status = (
            SafetyStatus.REVIEW
            if findings
            else SafetyStatus.ALLOW
        )

        return SafetyAssessment(
            status=status,
            findings=findings,
            metadata=SafetyMetadata(
                file_count=file_count,
                total_size_bytes=total_size,
                inspected_files=file_count,
            ),
        )