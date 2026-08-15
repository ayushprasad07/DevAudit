from __future__ import annotations

from .models import (
    InterpretedRelease,
    ReleaseItem,
    MarkdownNode
)

class ReleaseInterpreter:

    def interpret(
            self,
            nodes : list[MarkdownNode],
    ) -> InterpretedRelease:

        result = InterpretedRelease()

        current_heading : str | None = None
        current_heading_level = 0

        for node in nodes:

            if node.type == "heading":

                current_heading = node.content
                current_heading_level = node.level

                continue

            if node.type == "paragraph":

                if node.content.strip():

                    result.items.append(
                        ReleaseItem(
                            text=node.content,
                            heading=current_heading,
                            heading_level=current_heading_level,
                            source_type="paragraph",
                        )
                    )

                continue

            if node.type in {"list", "ordered_list"}:

                for item in node.children:

                    if not item.content.strip():
                        continue

                    result.items.append(
                        ReleaseItem(
                            text=item.content,
                            heading=current_heading,
                            heading_level=current_heading_level,
                            source_type="list_item",
                        )
                    )

                continue

        return result