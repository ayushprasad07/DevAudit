from __future__ import annotations

from dataclasses import dataclass, field

@dataclass
class MarkdownNode:
    type : str

    content : str = ""

    level : int = 0

    children : list[MarkdownNode] = field(default_factory=list)

@dataclass(slots = True)
class ReleaseItem:
    text : str
    heading: str | None = None
    heading_level: int = 0
    source_type : str = "text"

@dataclass(slots = True)
class InterpretedRelease:

    items : list[ReleaseItem] = field(default_factory=list)