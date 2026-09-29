from __future__ import annotations

from app.intelligence.breaking_changes.models import (
    ParsedRelease,
    RawRelease,
)

from .base import BaseReleaseParser
from .markdown_parser import MarkdownParser
from .metadata_filter import MetadataFilter
from .release_interpreter import ReleaseInterpreter
from ..analyzer import IntelligenceAnalyzer


class GenericReleaseParser(BaseReleaseParser):

    def __init__(self) -> None:
        self._markdown_parser = MarkdownParser()
        self._interpreter = ReleaseInterpreter()
        self._metadata_filter = MetadataFilter()
        self._analyzer = IntelligenceAnalyzer()

    def parse(
        self,
        release: RawRelease,
    ) -> ParsedRelease:

        nodes = self._markdown_parser.parse(
            release.body
        )

        interpreted = self._interpreter.interpret(
            nodes
        )

        items = self._metadata_filter.filter(
            items=interpreted.items
        )

        analysis = self._analyzer.analyze(
            items=items,
            version=release.version,
            release_url=release.url,
        )

        parsed = ParsedRelease(
            release=release,
        )

        parsed.breaking_changes.extend(
            analysis.breaking_changes
        )

        return parsed