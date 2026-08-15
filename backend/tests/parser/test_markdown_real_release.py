from pathlib import Path

from app.intelligence.breaking_changes.parser.markdown_parser import (
    MarkdownParser,
)


def test_flask_markdown_structure():

    path = Path(
        "tests/fixtures/flask/flask_v3.1.0.md"
    )

    markdown = path.read_text()

    parser = MarkdownParser()

    nodes = parser.parse(markdown)

    assert nodes

    contents = [
        node.content
        for node in nodes
        if node.content
    ]

    assert any(
        "Drop support for Python 3.8" in content
        for content in contents
    )