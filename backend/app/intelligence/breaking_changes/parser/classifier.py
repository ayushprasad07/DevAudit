from __future__ import annotations

import re

from app.intelligence.breaking_changes.models import (
    BreakingChange,
    BreakingChangeCategory,
    BreakingChangeSeverity,
    BreakingChangeSource,
    RawRelease,
)

from .patterns import (
    API_CHANGE_KEYWORDS,
    BREAKING_HEADINGS,
    CONFIGURATION_HEADINGS,
    CONFIGURATION_KEYWORDS,
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

    BULLET_PATTERN = re.compile(r"^\s*[-*+]\s+(.*)$")

    API_PATTERN = re.compile(
        r"\b[A-Za-z_][A-Za-z0-9_]*(?:[./][A-Za-z0-9_]+)+\b"
    )

    FILE_PATTERN = re.compile(
        r"\b[\w./-]+\.(?:ts|tsx|js|jsx|py|java|go|rb|php|json|ya?ml|toml|ini|env)\b"
    )

    def classify(
            self,
            release : RawRelease,
            heading : str,
            content : str
    ) -> list[BreakingChange]:

        changes: list[BreakingChange] = []

        items = self._extract_items(content)

        for item in items:

            category = self._detect_category(
                heading,
                item,
            )

            severity = self._detect_severity(
                category,
                item,
            )

            changes.append(
                BreakingChange(
                    version=release.version,
                    title=self._build_title(item),
                    description=item,
                    category=category,
                    severity=severity,
                    source=BreakingChangeSource.GITHUB_RELEASE,
                    release_url=release.url,
                    affected_apis=self._extract_affected_apis(item),
                    affected_files=self._extract_affected_files(item),
                    confidence=self._calculate_confidence(
                        heading,
                        item,
                        category,
                    ),
                )
            )

        return changes

    def _extract_items(
            self,
            content : str
    ) -> list[str]:

        items : list[str] = []

        for line in content.splitlines():

            line = line.strip()

            if not line :
                continue

            match = self.BULLET_PATTERN.match(line)

            if match:
                items.append(match.group(1).strip())

            else:
                items.append(line)

        return items

    def _build_title(
            self,
            text : str
    ) -> str:

        text = text.strip()

        if len(text)<= 80:
            return text

        return text[:77] + "....."

    def _detect_category(
        self,
        heading: str,
        text: str,
    ) -> BreakingChangeCategory:

        combined = f"{heading} {text}".lower()

        # Configuration changes usually reference project files.
        if self._extract_affected_files(text):
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

        return BreakingChangeCategory.OTHER

    def _detect_severity(
        self,
        category: BreakingChangeCategory,
        text : str
    ) -> BreakingChangeSeverity:

        text = text.lower()

        if any(word in text for word in(
            "breaking",
            "must",
            "required",
            "incompatible",
        )):

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

    def _extract_affected_apis(
        self,
        text: str,
    ) -> list[str]:

        apis = set(self.API_PATTERN.findall(text))
        files = set(self._extract_affected_files(text))

        return sorted(apis - files)

    def _extract_affected_files(
            self,
            text : str
    ) -> list[str]:

        return sorted(
            set(
                self.FILE_PATTERN.findall(text)
            )
        )

    def _calculate_confidence(
        self,
        heading: str,
        text: str,
        category: BreakingChangeCategory,
    ) -> float:

        score = 0.2

        if category != BreakingChangeCategory.OTHER:
            score += 0.3

        if self._extract_affected_files(text):
            score += 0.2

        if self._extract_affected_apis(text):
            score += 0.2

        if self._contains_any(
            text.lower(),
            REMOVAL_KEYWORDS
            | DEPRECATION_KEYWORDS
            | SECURITY_KEYWORDS,
        ):
            score += 0.1

        return min(score, 1.0)

    @staticmethod
    def _contains_any(
        text : str,
        keywords : set[str]
    ) -> bool:

        return any(keyword in text for keyword in keywords)