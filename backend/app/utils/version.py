from __future__ import annotations

import re

from packaging.version import Version, InvalidVersion

_VERSION_PATTERN = re.compile(r"(\d+\.\d+\.\d+(?:[-a-zA-Z0-9.]*)?)")

def normalize_version(version: str) -> str:

    if not version:
        return ""
    
    version = version.strip()

    match = _VERSION_PATTERN.search(version)

    if not match:
        return ""

    if match:
        return match.group(1)
    
    return version

def parse_version(version: str)-> Version:

    normalize = normalize_version(version)

    return Version(normalize)


def is_valid_version(version: str) -> bool:
    try:
        parse_version(version)
        return True
    except InvalidVersion:
        return False
    
def compare_versions(version1 : str, version2: str) -> int:

    v1 = parse_version(version1)
    v2 = parse_version(version2)

    if v1>v2:
        return 1
    
    if v1<v2:
        return -1
    
    return 0

def is_newer(candidate : str, current : str) -> bool:

    return parse_version(candidate) > parse_version(current)

def is_version_in_range(
        version : str,
        current : str,
        target: str
) -> bool:

    parse = parse_version(version)

    return (
        parse_version(current) <= parse <= parse_version(target)
    )

def sort_version(
        versions : list[str],
        reverse : bool = True
) -> list[str]:
    
    return sorted(
        versions,
        key=parse_version,
        reverse=reverse
    )

def filter_versions_in_range(
    versions: list[str],
    current: str,
    target: str,
) -> list[str]:
    """
    Returns only versions where

        current < version <= target
    """
    return [
        version
        for version in versions
        if is_valid_version(version)
        and is_version_in_range(
            version,
            current,
            target,
        )
    ]
