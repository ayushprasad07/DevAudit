from app.intelligence.breaking_changes.parser.markdown_parser import (
    MarkdownParser,
)
from app.intelligence.breaking_changes.parser.release_interpreter import (
    ReleaseInterpreter,
)


def test_release_interpreter():

    markdown = """
# Version 5.0

## Breaking Changes

- Removed the legacy authentication API.
- Configuration format has changed.

## Improvements

- Faster startup time.
"""

    parser = MarkdownParser()

    nodes = parser.parse(markdown)

    interpreter = ReleaseInterpreter()

    result = interpreter.interpret(nodes)

    assert len(result.items) == 3

    first = result.items[0]

    assert first.text == (
        "Removed the legacy authentication API."
    )

    assert first.heading == "Breaking Changes"
    assert first.heading_level == 2
    assert first.source_type == "list_item"

    second = result.items[1]

    assert second.heading == "Breaking Changes"

    third = result.items[2]

    assert third.heading == "Improvements"