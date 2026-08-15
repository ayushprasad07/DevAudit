from __future__ import annotations

from app.intelligence.breaking_changes.models import (
    ParsedRelease,
    RawRelease,
)

from .base import BaseReleaseParser
from .markdown_parser import MarkdownParser


class GenericReleaseParser(BaseReleaseParser):

    def __init__(self) -> None:

        self._markdown_parser = MarkdownParser()

    def parse(
        self,
        release: RawRelease,
    ) -> ParsedRelease:

        nodes = self._markdown_parser.parse(
            release.body
        )

        parsed = ParsedRelease(
            release=release,
        )

        # Intelligence layer will consume these
        # structured nodes in the next phase.

        return parsed