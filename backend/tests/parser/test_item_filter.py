from app.intelligence.breaking_changes.parser.item_filter import (
    ItemFilter,
)


def test_generic_metadata_filter():

    item_filter = ItemFilter()

    assert not item_filter.should_include(
        "PyPI: https://pypi.org/project/Flask/"
    )

    assert not item_filter.should_include(
        "Release notes: https://example.com/releases"
    )

    assert not item_filter.should_include(
        "Changelog: https://github.com/example/project"
    )

    assert not item_filter.should_include(
        "Documentation: https://docs.example.com"
    )

    assert not item_filter.should_include(
        "https://example.com"
    )

    assert item_filter.should_include(
        "Drop support for Python 3.8."
    )

    assert item_filter.should_include(
        "Update minimum dependency versions."
    )

    assert item_filter.should_include(
        "Request.max_content_length can be customized per-request."
    )