from __future__ import annotations

from app.intelligence.breaking_changes.models import (
    ParsedRelease,
    RawRelease,
)

from .base import BaseReleaseParser
from .markdown_parser import MarkdownParser
from ..rule_engine import RuleEngine
from .release_interpreter import ReleaseInterpreter

class GenericReleaseParser(BaseReleaseParser):

    def __init__(self) -> None:

        self._markdown_parser = MarkdownParser()
        self._intepreter = ReleaseInterpreter()
        self._rule_engine = RuleEngine()

    def parse(
        self,
        release: RawRelease,
    ) -> ParsedRelease:

        nodes = self._markdown_parser.parse(
            release.body
        )

        interpreted = self._intepreter.interpret(
            nodes
        )

        parsed = ParsedRelease(
            release=release,
        )

        for item in interpreted.items:

            changes = self._rule_engine.evaluate(
                item=item,
                version=release.version,
                release_url=release.url,
            )

            parsed.breaking_changes.extend(changes)

        # Intelligence layer will consume these
        # structured nodes in the next phase.

        return parsed