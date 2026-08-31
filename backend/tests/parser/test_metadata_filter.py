from app.intelligence.breaking_changes.parser.metadata_filter import (
    MetadataFilter,
)
from app.intelligence.breaking_changes.parser.models import (
    ReleaseItem,
)


def make_item(text: str) -> ReleaseItem:

    return ReleaseItem(
        text=text,
        heading=None,
        heading_level=0,
        source_type="paragraph",
    )


def test_filters_release_metadata():

    items = [
        make_item(
            "PyPI: https://pypi.org/project/Flask/3.1.0/"
        ),
        make_item(
            "Changes: https://example.com/changelog"
        ),
        make_item(
            "Milestone: https://github.com/example/milestone/1"
        ),
        make_item(
            "Drop support for Python 3.8."
        ),
    ]

    result = MetadataFilter().filter(items)

    assert len(result) == 1

    assert result[0].text == (
        "Drop support for Python 3.8."
    )


def test_keeps_normal_release_item_with_url():

    item = make_item(
        "The migration guide is available at "
        "https://example.com/migration"
    )

    result = MetadataFilter().filter([item])

    assert len(result) == 1


def test_filters_standalone_url():

    item = make_item(
        "https://example.com/changelog"
    )

    result = MetadataFilter().filter([item])

    assert result == []