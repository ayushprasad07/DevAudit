from app.intelligence.breaking_changes.parser.markdown_parser import (
    MarkdownParser,
)


def test_markdown_parser():

    markdown = """
# Release

## Breaking Changes

- Removed old API.
- Configuration must be updated.

## Improvements

- Improved performance.
"""

    parser = MarkdownParser()

    nodes = parser.parse(markdown)

    assert len(nodes) > 0

    headings = [
        node
        for node in nodes
        if node.type == "heading"
    ]

    assert headings[0].content == "Release"
    assert headings[1].content == "Breaking Changes"
    assert headings[2].content == "Improvements"

    lists = [
        node
        for node in nodes
        if node.type == "list"
    ]

    assert len(lists) == 2

    assert lists[0].children[0].content == (
        "Removed old API."
    )