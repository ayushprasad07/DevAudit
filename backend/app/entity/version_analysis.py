from dataclasses import dataclass

from app.enums.update_type import UpdateType

@dataclass(frozen=True)
class VersionAnalysis:

    is_outdated: bool

    update_type: UpdateType