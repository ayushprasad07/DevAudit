from __future__ import annotations

from app.intelligence.breaking_changes.parser.models import (
    InterpretedRelease,
    MarkdownNode,
    ReleaseItem,
)


class ReleaseInterpreter:

    def interpret(
        self,
        nodes: list[MarkdownNode],
    ) -> InterpretedRelease:

        result = InterpretedRelease()

        current_heading: str | None = None
        current_heading_level = 0

        for node in nodes:

            if node.type == "heading":

                current_heading = node.content
                current_heading_level = node.level

                continue

            if node.type == "paragraph":

                self._interpret_paragraph(
                    node=node,
                    result=result,
                    heading=current_heading,
                    heading_level=current_heading_level,
                )

                continue

            if node.type in {
                "list",
                "ordered_list",
            }:

                self._interpret_list(
                    node=node,
                    result=result,
                    heading=current_heading,
                    heading_level=current_heading_level,
                )

        return result

    def _interpret_paragraph(
        self,
        node: MarkdownNode,
        result: InterpretedRelease,
        heading: str | None,
        heading_level: int,
    ) -> None:

        content = node.content.strip()

        if not content:
            return

        # A paragraph is structurally one document unit.
        #
        # However, some release notes are written as plain text
        # where multiple release items are separated by lines.
        #
        # Preserve those source boundaries without attempting
        # to understand the meaning of the lines.

        lines = [
            line.strip()
            for line in content.splitlines()
            if line.strip()
        ]

        if len(lines) <= 1:

            result.items.append(
                ReleaseItem(
                    text=content,
                    heading=heading,
                    heading_level=heading_level,
                    source_type="paragraph",
                )
            )

            return

        for line in lines:

            result.items.append(
                ReleaseItem(
                    text=line,
                    heading=heading,
                    heading_level=heading_level,
                    source_type="paragraph_line",
                )
            )

    def _interpret_list(
        self,
        node: MarkdownNode,
        result: InterpretedRelease,
        heading: str | None,
        heading_level: int,
    ) -> None:

        for item in node.children:

            self._interpret_list_item(
                item=item,
                result=result,
                heading=heading,
                heading_level=heading_level,
            )

    def _interpret_list_item(
        self,
        item: MarkdownNode,
        result: InterpretedRelease,
        heading: str | None,
        heading_level: int,
    ) -> None:

        content = item.content.strip()

        if content:

            result.items.append(
                ReleaseItem(
                    text=content,
                    heading=heading,
                    heading_level=heading_level,
                    source_type="list_item",
                )
            )

        # Preserve nested list content as independent items.
        for child in item.children:

            if child.type in {
                "list",
                "ordered_list",
            }:

                self._interpret_list(
                    node=child,
                    result=result,
                    heading=heading,
                    heading_level=heading_level,
                )