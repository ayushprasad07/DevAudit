from abc import ABC, abstractmethod

from app.intelligence.breaking_changes.models import (
    RawRelease,
    ParsedRelease,
)


class BaseReleaseParser(ABC):

    @abstractmethod
    def parse(
        self,
        release: RawRelease,
    ) -> ParsedRelease:
        """
        Parse a release into structured breaking changes.
        """

        raise NotImplementedError