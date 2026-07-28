from __future__ import annotations

from app.intelligence.breaking_changes.models import (
    ParsedRelease,
    RawRelease,
)

from .base import BaseReleaseParser
from .classifier import BreakingChangeClassifier
from .normalizer import MarkdownNormalizer
from .section import SectionExtractor


class GenericReleaseParser(BaseReleaseParser):

    def __init__(self) -> None:

        self._normalizer = MarkdownNormalizer()
        self._section_extractor = SectionExtractor()
        self._classifier = BreakingChangeClassifier()


    def parse(
            self,
            release: RawRelease,
    )-> ParsedRelease:

        markdown = self._normalizer.normalizer(
            release.body
        )

        sections = self._section_extractor.extract(
            markdown
        )

        parsed = ParsedRelease(
            release=release,
        )

        for section in sections:

            changes = self._classifier.classify(
                release=release,
                heading=section.heading,
                content=section.content,
            )

            parsed.breaking_changes.extend(changes)

        return parsed