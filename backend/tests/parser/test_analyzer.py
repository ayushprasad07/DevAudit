from app.intelligence.breaking_changes.parser.analyzer import (
    SentenceAnalyzer,
)


def test_sentence_analyzer():

    analyzer = SentenceAnalyzer()

    sentence = (
        "Request.max_content_length "
        "uses MAX_CONTENT_LENGTH "
        "in config.py. "
        "See https://flask.palletsprojects.com "
        "Requires Python 3.11."
    )

    parsed = analyzer.analyze(sentence)

    assert parsed.urls == [
        "https://flask.palletsprojects.com"
    ]

    assert "Request.max_content_length" in parsed.apis

    assert "config.py" in parsed.files

    assert "MAX_CONTENT_LENGTH" in parsed.config_keys

    assert "3.11" in parsed.versions

    assert "request" in parsed.keywords