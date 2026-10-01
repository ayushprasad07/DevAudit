import json
from pathlib import Path

from .models import FindingSeverity, SafetyFinding

INSTALL_SCRIPT_NAMES = {
    "preinstall",
    "install",
    "postinstall",
    "prepare",
}

def inspect_package_json(path : Path) -> list[SafetyFinding]:

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

    scripts = data.get("scripts",{})

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