from __future__ import annotations

from markdown_it import MarkdownIt

from .models import MarkdownNode


class MarkdownParser:

    def __init__(self) -> None:
        self._parser = MarkdownIt("commonmark")

    def parse(
        self,
        markdown: str,
    ) -> list[MarkdownNode]:

        tokens = self._parser.parse(markdown)

        nodes: list[MarkdownNode] = []

        index = 0

        while index < len(tokens):

            token = tokens[index]

            # -------------------------
            # Headings
            # -------------------------
            if token.type == "heading_open":

                level = int(token.tag[1])

                content = self._inline_content(
                    tokens,
                    index + 1,
                )

                nodes.append(
                    MarkdownNode(
                        type="heading",
                        content=content,
                        level=level,
                    )
                )

                index += 3
                continue

            # -------------------------
            # Paragraphs
            # -------------------------
            if token.type == "paragraph_open":

                content = self._inline_content(
                    tokens,
                    index + 1,
                )

                if content:
                    nodes.append(
                        MarkdownNode(
                            type="paragraph",
                            content=content,
                        )
                    )

                index += 3
                continue

            # -------------------------
            # Bullet / ordered lists
            # -------------------------
            if token.type in {
                "bullet_list_open",
                "ordered_list_open",
            }:

                list_node, index = self._parse_list(
                    tokens,
                    index,
                )

                nodes.append(list_node)

                continue

            index += 1

        return nodes

    # --------------------------------------------------
    # Inline content
    # --------------------------------------------------

    @staticmethod
    def _inline_content(
        tokens,
        index: int,
    ) -> str:

        if (
            index < len(tokens)
            and tokens[index].type == "inline"
        ):
            return tokens[index].content.strip()

        return ""

    # --------------------------------------------------
    # List parsing
    # --------------------------------------------------

    def _parse_list(
        self,
        tokens,
        start: int,
    ) -> tuple[MarkdownNode, int]:

        opening_token = tokens[start]

        list_type = (
            "ordered_list"
            if opening_token.type == "ordered_list_open"
            else "list"
        )

        items: list[MarkdownNode] = []

        index = start + 1

        while index < len(tokens):

            token = tokens[index]

            # End of THIS list — reached only when nested lists
            # have already been fully consumed via recursion below,
            # so this close token always belongs to this list.
            if token.type in {
                "bullet_list_close",
                "ordered_list_close",
            }:
                return (
                    MarkdownNode(
                        type=list_type,
                        children=items,
                    ),
                    index + 1,
                )

            if token.type == "list_item_open":

                item_node, index = self._parse_list_item(
                    tokens,
                    index,
                )

                items.append(item_node)
                continue

            index += 1

        # Malformed input (no matching close found) — return what we have.
        return (
            MarkdownNode(
                type=list_type,
                children=items,
            ),
            index,
        )

    def _parse_list_item(
        self,
        tokens,
        start: int,
    ) -> tuple[MarkdownNode, int]:

        content_parts: list[str] = []
        children: list[MarkdownNode] = []

        index = start + 1

        while index < len(tokens):

            token = tokens[index]

            if token.type == "list_item_close":
                content = " ".join(content_parts)

                return (
                    MarkdownNode(
                        type="list_item",
                        content=content,
                        children=children,
                    ),
                    index + 1,
                )

            # Nested list inside this item — recurse instead of
            # flattening its tokens into this item's inline text.
            if token.type in {
                "bullet_list_open",
                "ordered_list_open",
            }:

                nested_node, index = self._parse_list(
                    tokens,
                    index,
                )

                children.append(nested_node)
                continue

            if token.type == "inline":
                text = token.content.strip()

                if text:
                    content_parts.append(text)

            index += 1

        # Malformed input (no matching close found) — return what we have.
        content = " ".join(content_parts)

        return (
            MarkdownNode(
                type="list_item",
                content=content,
                children=children,
            ),
            index,
        )