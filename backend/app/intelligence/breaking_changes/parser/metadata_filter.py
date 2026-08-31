from __future__ import annotations

import re

from .models import ReleaseItem


class MetadataFilter:

    _METADATA_PREFIXES = (
        "pypi:",
        "npm:",
        "changelog:",
        "changes:",
        "milestone:",
        "release notes:",
        "release note:",
        "full changelog:",
        "compare:",
        "documentation:",
        "docs:",
    )

    _URL_PATTERN = re.compile(
        r"^https?://\S+$",
        re.IGNORECASE,
    )

    def filter(
        self,
        items: list[ReleaseItem],
    ) -> list[ReleaseItem]:

        return [
            item
            for item in items
            if self._is_meaningful(item.text)
        ]

    def _is_meaningful(
        self,
        text: str,
    ) -> bool:

        normalized = text.strip().lower()

        if not normalized:
            return False

        if self._URL_PATTERN.fullmatch(normalized):
            return False

        if normalized.startswith(
            self._METADATA_PREFIXES
        ):
            return False

        return True