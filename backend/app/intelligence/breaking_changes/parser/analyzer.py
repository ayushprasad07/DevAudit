from __future__ import annotations

from app.intelligence.breaking_changes.parser.models import ParsedSentence

from app.intelligence.breaking_changes.parser.patterns import (
    API_PATTERN,
    CONFIG_PATTERN,
    FILE_PATTERN,
    URL_PATTERN,
    VERSION_PATTERN,
    WORD_PATTERN,
)

class SentenceAnalyzer:

    def analyze(
            self,
            text : str
    ) -> ParsedSentence:

        urls = URL_PATTERN.findall(text)

        clean_text = URL_PATTERN.sub("", text)

        files = FILE_PATTERN.findall(clean_text)

        apis = [
            api
            for api in API_PATTERN.findall(clean_text)
            if api not in files
        ]

        consfig_key = CONFIG_PATTERN.findall(clean_text)

        versions = VERSION_PATTERN.findall(clean_text)

        keywords = {
            word.lower()
            for word in WORD_PATTERN.findall(clean_text)
        }

        return ParsedSentence(
            text=text,
            urls=urls,
            files=sorted(set(files)),
            apis=sorted(set(apis)),
            config_keys=sorted(set(consfig_key)),
            versions=sorted(set(versions)),
            keywords=keywords,
        )