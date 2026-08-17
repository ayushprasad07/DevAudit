from pathlib import Path

from app.intelligence.breaking_changes.parser.markdown_parser import (
    MarkdownParser,
)
from app.intelligence.breaking_changes.parser.release_interpreter import (
    ReleaseInterpreter,
)


def test_flask_structure():

    fixture = Path(
        "tests/parser/fixtures/flask/flask_v3.1.0.md"
    )

    markdown = fixture.read_text()

    parser = MarkdownParser()

    nodes = parser.parse(markdown)

    print("\n========== MARKDOWN NODES ==========")

    for node in nodes:
        print(
            f"type={node.type!r}, "
            f"content={node.content[:100]!r}, "
            f"level={node.level}"
        )

    interpreter = ReleaseInterpreter()

    result = interpreter.interpret(nodes)

    print("\n========== RELEASE ITEMS ==========")

    for item in result.items:
        print(
            f"type={item.source_type!r}, "
            f"heading={item.heading!r}, "
            f"text={item.text[:150]!r}"
        )

    assert nodes
    assert result.items