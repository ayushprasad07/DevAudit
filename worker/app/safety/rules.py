import json
from pathlib import Path
from typing import Protocol

from .config import SafetyLimits
from .models import FindingSeverity, SafetyFinding


INSTALL_SCRIPT_NAMES = {
    "preinstall",
    "install",
    "postinstall",
    "prepare",
}


class SafetyRule(Protocol):
    name: str

    def inspect(self, repository_path: Path) -> list[SafetyFinding]:
        ...


def inspect_package_json(path: Path) -> list[SafetyFinding]:
    findings: list[SafetyFinding] = []

    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError):
        return [
            SafetyFinding(
                rule="INVALID_PACKAGE_JSON",
                severity=FindingSeverity.MEDIUM,
                message="package.json could not be safely parsed.",
                path=str(path),
            )
        ]

    scripts = data.get("scripts", {})

    if not isinstance(scripts, dict):
        return findings

    for script_name in INSTALL_SCRIPT_NAMES:
        script = scripts.get(script_name)

        if script is None:
            continue

        findings.append(
            SafetyFinding(
                rule="INSTALL_SCRIPT",
                severity=FindingSeverity.HIGH,
                message=(
                    f"package.json contains the '{script_name}' "
                    "lifecycle script."
                ),
                path=str(path),
                evidence=str(script),
            )
        )

    return findings


def inspect_repository_structure(
    repository_path: Path,
    limits: SafetyLimits,
) -> list[SafetyFinding]:
    findings: list[SafetyFinding] = []

    file_count = 0

    try:
        for path in repository_path.rglob("*"):
            if path.is_symlink():
                findings.append(
                    SafetyFinding(
                        rule="SYMLINK_DETECTED",
                        severity=FindingSeverity.HIGH,
                        message=(
                            "Repository contains a symbolic link. "
                            "It must be validated before execution."
                        ),
                        path=str(path),
                    )
                )
                continue

            if not path.is_file():
                continue

            file_count += 1

            if file_count > limits.max_files:
                findings.append(
                    SafetyFinding(
                        rule="FILE_COUNT_LIMIT",
                        severity=FindingSeverity.CRITICAL,
                        message=(
                            f"Repository contains more than "
                            f"{limits.max_files} files."
                        ),
                    )
                )
                break

            try:
                size = path.stat().st_size
            except OSError as exc:
                findings.append(
                    SafetyFinding(
                        rule="FILE_STAT_FAILED",
                        severity=FindingSeverity.MEDIUM,
                        message="Could not inspect file metadata.",
                        path=str(path),
                        evidence=str(exc),
                    )
                )
                continue

            if size > limits.max_file_size_bytes:
                findings.append(
                    SafetyFinding(
                        rule="FILE_SIZE_LIMIT",
                        severity=FindingSeverity.HIGH,
                        message=(
                            f"File exceeds the maximum allowed size "
                            f"of {limits.max_file_size_bytes} bytes."
                        ),
                        path=str(path),
                    )
                )

    except OSError as exc:
        findings.append(
            SafetyFinding(
                rule="REPOSITORY_SCAN_FAILED",
                severity=FindingSeverity.CRITICAL,
                message="Repository structure could not be inspected.",
                evidence=str(exc),
            )
        )

    return findings