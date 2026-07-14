from dataclasses import dataclass, field
from typing import List, Optional

@dataclass(frozen=True)
class Dependebcy:

    """
    Represents a dependency
    """

    name: str

    current_version: str