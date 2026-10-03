import json
from pathlib import Path
from typing import Protocol

import tomllib

from .config import SafetyLimits
from .models import FindingSeverity, SafetyFinding

import ast


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

def inspect_python_file(repository_path : Path) -> list[SafetyFinding]:

    findings : list[SafetyFinding] = []

    setup_py = repository_path/"setup.py"

    if setup_py.is_file():
        findings.append(
            SafetyFinding(
                rule="PYTHON_SETUP_SCRIPT",
                severity=FindingSeverity.HIGH,
                message=(
                    "Repository contains setup.py, which can execute "
                    "Python code during package installation/build."
                ),
                path=str(setup_py),
            )
        )

    findings.extend(inspect_setup_py(repository_path/"setup.py"))

    setup_config = repository_path/"setup.cfg"

    if setup_config.is_file():
        findings.append(
            SafetyFinding(
                rule="PYTHON_SETUP_CONFIG",
                severity=FindingSeverity.MEDIUM,
                message=(
                    "Repository contains setup.cfg, which may define "
                    "package build or installation configuration."
                ),
                path=str(setup_config),
            )
        )

    pyproject = repository_path/"pyproject.toml"

    if pyproject.is_file():

        try:
            data = tomllib.loads(
                pyproject.read_text(encoding="utf-8")
            )
        except (OSError, UnicodeDecodeError, tomllib.TomlDecodeError):
            findings.append(
                SafetyFinding(
                    rule="INVALID_PYPROJECT",
                    severity=FindingSeverity.MEDIUM,
                    message="pyproject.toml could not be safely parsed.",
                    path=str(pyproject),
                )
            )

        else:

            build_system = data.get("build-system")

            if build_system is not None:

                if not isinstance(build_system, dict):
                    findings.append(
                        SafetyFinding(
                            rule="INVALID_BUILD_SYSTEM",
                            severity=FindingSeverity.HIGH,
                            message=(
                                "The build-system section in pyproject.toml "
                                "has an invalid structure."
                            ),
                            path=str(pyproject),
                        )
                    )

                else:
                    backend = build_system.get("build-backend")
                    requires = build_system.get("requires")

                    if backend is None:

                        findings.append(
                            SafetyFinding(
                                rule="MISSING_BUILD_BACKEND",
                                severity=FindingSeverity.MEDIUM,
                                message=(
                                    "pyproject.toml defines a build-system "
                                    "without specifying a build-backend."
                                ),
                                path=str(pyproject),
                            )
                        )

                    if requires is None or not isinstance(requires, list):
                        findings.append(
                            SafetyFinding(
                                rule="INVALID_BUILD_REQUIREMENTS",
                                severity=FindingSeverity.MEDIUM,
                                message=(
                                    "The build-system 'requires' field "
                                    "must be a list."
                                ),
                                path=str(pyproject),
                            )
                        )

                    if backend is not None:
                        findings.append(
                            SafetyFinding(
                                rule="PYTHON_BUILD_BACKEND",
                                severity=FindingSeverity.MEDIUM,
                                message=(
                                    "Repository defines a Python build backend "
                                    "that must be evaluated before package building."
                                ),
                                path=str(pyproject),
                                evidence=str(backend),
                            )
                        )

    return findings

def inspect_setup_py(path : Path) -> list[SafetyFinding]:

    findings : list[SafetyFinding] = []

    try:
        source = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as exc:

        return [
            SafetyFinding(
                rule="SETUP_PY_READ_FAILED",
                severity=FindingSeverity.MEDIUM,
                message="setup.py could not be read safely.",
                path=str(path),
                evidence=str(exc),
            )
        ]

    try:
        tree = ast.parse(source,filename=str(path))
    except SyntaxError as exc:

        return [
            SafetyFinding(
                rule="SETUP_PY_PARSE_FAILED",
                severity=FindingSeverity.MEDIUM,
                message="setup.py could not be parsed as valid python.",
                path=str(path),
                evidence=str(exc),
            )
        ]

    for node in ast.walk(tree):

        if isinstance(node, ast.Import):
            for alias in node.names:
                if alias.name == "subprocess":
                    findings.append(
                        SafetyFinding(
                            rule="SETUP_PY_SUBPROCESS",
                            severity=FindingSeverity.HIGH,
                            message=(
                                "setup.py imports the subprocess module, "
                                "which can execute external processes."
                            ),
                            path=str(path),
                        )
                    )
                elif alias.name == "os":
                    findings.append(
                        SafetyFinding(
                            rule="SETUP_PY_OS",
                            severity=FindingSeverity.MEDIUM,
                            message=(
                                "setup.py imports the os module, "
                                "which can execute external processes."
                            ),
                            path=str(path),
                        )
                    )

        elif isinstance(node, ast.ImportFrom):
            if node.module == "subprocess":
                findings.append(
                    SafetyFinding(
                        rule="SETUP_PY_SUBPROCESS",
                        severity=FindingSeverity.HIGH,
                        message=(
                            "setup.py imports from subprocess, which can "
                            "execute external processes."
                        ),
                        path=str(path),
                    )
                )
            elif node.module == "os":
                findings.append(
                    SafetyFinding(
                        rule="SETUP_PY_OS",
                        severity=FindingSeverity.MEDIUM,
                        message=(
                            "setup.py imports from os, which can "
                            "execute external processes."
                        ),
                        path=str(path),
                    )
                )

        elif isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name):
                if node.func.id == "eval":
                    findings.append(
                        SafetyFinding(
                            rule="SETUP_PY_EVAL",
                            severity=FindingSeverity.HIGH,
                            message=(
                                "setup.py uses eval(), which dynamically "
                                "evaluates Python expressions."
                            ),
                            path=str(path),
                        )
                    )
                elif node.func.id == "exec":
                    findings.append(
                        SafetyFinding(
                            rule="SETUP_PY_EXEC",
                            severity=FindingSeverity.HIGH,
                            message=(
                                "setup.py uses exec(), which dynamically "
                                "executes Python code."
                            ),
                            path=str(path),
                        )
                    )
            elif isinstance(node.func, ast.Attribute):
                if(
                    isinstance(node.func.value, ast.Name)
                    and node.func.value.id == "os"
                    and node.func.attr in {"system", "popen"}
                ):
                    findings.append(
                        SafetyFinding(
                            rule="SETUP_PY_OS_COMMAND",
                            severity=FindingSeverity.HIGH,
                            message=(
                                f"setup.py uses os.{node.func.attr}(), "
                                "which can execute system commands."
                            ),
                            path=str(path),
                        )
                    )

    return findings