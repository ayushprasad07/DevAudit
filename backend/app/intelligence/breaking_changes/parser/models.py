from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True, frozen=True)
class MarkdownSection:
    """
    Represents a markdown section extracted from a release note.

    Example
    -------
    ## Breaking Changes

    Removed Image component.

    Deprecated next/head.
    """

    heading: str

    level: int

    content: str