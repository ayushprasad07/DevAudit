from __future__ import annotations

from dataclasses import dataclass, field


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

@dataclass(slots=True)
class ParsedSentence:
    """
    Internal parser representation.

    This object contains every fact extracted from a sentence.
    Rules/classifiers should consume this instead of running regexes.
    """

    text: str

    urls: list[str] = field(default_factory=list)

    files: list[str] = field(default_factory=list)

    apis: list[str] = field(default_factory=list)

    config_keys: list[str] = field(default_factory=list)

    versions: list[str] = field(default_factory=list)

    keywords: set[str] = field(default_factory=set)