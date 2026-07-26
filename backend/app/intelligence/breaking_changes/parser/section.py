from __future__ import annotations

import re

from .models import MarkdownSection

_HEADING_PATTERN = re.compile(
    r"^(#{1,6})\s+(.+?)\s*$"
)


class SectionExtractor:
    """
    Splits markdown into logical sections.
    """

    def extract(
        self,
        markdown: str,
    ) -> list[MarkdownSection]:

        sections: list[MarkdownSection] = []

        current_heading = "Introduction"
        current_level = 0
        current_lines: list[str] = []

        for line in markdown.splitlines():

            match = _HEADING_PATTERN.match(line)

            if match:

                if current_heading or current_lines:
                    sections.append(
                        MarkdownSection(
                            heading=current_heading,
                            level=current_level,
                            content="\n".join(current_lines).strip(),
                        )
                    )

                current_level = len(match.group(1))
                current_heading = match.group(2).strip()
                current_lines = []

                continue

            current_lines.append(line)

        sections.append(
            MarkdownSection(
                heading=current_heading,
                level=current_level,
                content="\n".join(current_lines).strip(),
            )
        )

        return sections