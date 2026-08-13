from __future__ import annotations

from app.intelligence.breaking_changes.models import (
    ParsedRelease,
    RawRelease,
)

from .base import BaseReleaseParser
from .classifier import BreakingChangeClassifier
from .normalizer import MarkdownNormalizer
from .section import SectionExtractor
from .analyzer import SentenceAnalyzer
from .item import ItemExtractor

class GenericReleaseParser(BaseReleaseParser):

    def __init__(self) -> None:

        self._normalizer = MarkdownNormalizer()
        self._section_extractor = SectionExtractor()
        self._classifier = BreakingChangeClassifier()
        self._analyzer = SentenceAnalyzer()
        self._item_extractor = ItemExtractor()


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
            items = self._item_extractor.extract(
                section.content
            )

            for item in items:

                sentence = self._analyzer.analyze(item)

                if not sentence:
                    continue

                changes = self._classifier.classify(
                    release=release,
                    heading=section.heading,
                    sentence=sentence,
                )

                parsed.breaking_changes.append(changes)

        return parsed