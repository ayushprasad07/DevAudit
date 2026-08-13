from __future__ import annotations

from app.intelligence.breaking_changes.models import (
    BreakingChange,
    BreakingChangeCategory,
    BreakingChangeSeverity,
    BreakingChangeSource,
    RawRelease,
)

from .models import ParsedSentence

from .patterns import (
    API_CHANGE_KEYWORDS,
    BREAKING_HEADINGS,
    DEPRECATION_HEADINGS,
    DEPRECATION_KEYWORDS,
    PERFORMANCE_HEADINGS,
    PERFORMANCE_KEYWORDS,
    REMOVAL_HEADINGS,
    REMOVAL_KEYWORDS,
    SECURITY_HEADINGS,
    SECURITY_KEYWORDS,
)


class BreakingChangeClassifier:

    def classify(
        self,
        release: RawRelease,
        heading: str,
        sentence: ParsedSentence,
    ) -> BreakingChange:

        category = self._detect_category(
            heading,
            sentence,
        )

        severity = self._detect_severity(
            category,
            sentence,
        )

        return BreakingChange(
            version=release.version,
            title=self._build_title(sentence.text),
            description=sentence.text,
            category=category,
            severity=severity,
            source=BreakingChangeSource.GITHUB_RELEASE,
            release_url=release.url,
            affected_apis=sentence.apis,
            affected_files=sentence.files,
            confidence=self._calculate_confidence(
                heading,
                sentence,
                category,
            ),
        )

    def _build_title(
        self,
        text: str,
    ) -> str:

        text = text.strip()

        if len(text) <= 80:
            return text

        return text[:77] + "..."

    def _detect_category(
        self,
        heading: str,
        sentence: ParsedSentence,
    ) -> BreakingChangeCategory:

        combined = (
            f"{heading} {sentence.text}"
        ).lower()

        if sentence.files:
            return BreakingChangeCategory.CONFIGURATION

        if sentence.config_keys:
            return BreakingChangeCategory.CONFIGURATION

        if self._contains_any(
            combined,
            REMOVAL_HEADINGS | REMOVAL_KEYWORDS,
        ):
            return BreakingChangeCategory.REMOVAL

        if self._contains_any(
            combined,
            DEPRECATION_HEADINGS | DEPRECATION_KEYWORDS,
        ):
            return BreakingChangeCategory.DEPRECATION

        if self._contains_any(
            combined,
            SECURITY_HEADINGS | SECURITY_KEYWORDS,
        ):
            return BreakingChangeCategory.SECURITY

        if self._contains_any(
            combined,
            PERFORMANCE_HEADINGS | PERFORMANCE_KEYWORDS,
        ):
            return BreakingChangeCategory.PERFORMANCE

        if self._contains_any(
            combined,
            BREAKING_HEADINGS | API_CHANGE_KEYWORDS,
        ):
            return BreakingChangeCategory.API_CHANGE

        if sentence.apis:
            return BreakingChangeCategory.API_CHANGE

        return BreakingChangeCategory.OTHER

    def _detect_severity(
        self,
        category: BreakingChangeCategory,
        sentence: ParsedSentence,
    ) -> BreakingChangeSeverity:

        keywords = sentence.keywords

        if any(
            word in keywords
            for word in {
                "breaking",
                "must",
                "required",
                "incompatible",
            }
        ):
            return BreakingChangeSeverity.BREAKING

        if category in {
            BreakingChangeCategory.REMOVAL,
            BreakingChangeCategory.API_CHANGE,
        }:
            return BreakingChangeSeverity.BREAKING

        if category in {
            BreakingChangeCategory.DEPRECATION,
            BreakingChangeCategory.SECURITY,
        }:
            return BreakingChangeSeverity.MAJOR

        if category in {
            BreakingChangeCategory.CONFIGURATION,
            BreakingChangeCategory.PERFORMANCE,
        }:
            return BreakingChangeSeverity.MODERATE

        return BreakingChangeSeverity.MINOR

    def _calculate_confidence(
        self,
        heading: str,
        sentence: ParsedSentence,
        category: BreakingChangeCategory,
    ) -> float:

        score = 0.2

        if category != BreakingChangeCategory.OTHER:
            score += 0.3

        if sentence.files:
            score += 0.2

        if sentence.apis:
            score += 0.2

        if sentence.config_keys:
            score += 0.1

        if self._contains_any(
            sentence.keywords,
            REMOVAL_KEYWORDS
            | DEPRECATION_KEYWORDS
            | SECURITY_KEYWORDS,
        ):
            score += 0.1

        return min(score, 1.0)

    @staticmethod
    def _contains_any(
        keywords: set[str],
        candidates: set[str],
    ) -> bool:

        return any(
            keyword.lower() in keywords
            for keyword in candidates
        )
    