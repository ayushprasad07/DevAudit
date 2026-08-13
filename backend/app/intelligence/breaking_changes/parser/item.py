from __future__ import annotations

import re


_BULLET_PATTERN = re.compile(
    r"^\s*[-*+]\s+(.*)$"
)


class ItemExtractor:
    """
    Extracts individual release-note items from a Markdown section.
    """

    def extract(
        self,
        content: str,
    ) -> list[str]:

        items: list[str] = []

        for line in content.splitlines():

            line = line.strip()

            if not line:
                continue

            match = _BULLET_PATTERN.match(line)

            if match:
                item = match.group(1).strip()

                if item:
                    items.append(item)

            else:
                items.append(line)

        return items