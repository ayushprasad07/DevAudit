from dataclasses import dataclass, field
from typing import List, Optional

@dataclass(frozen=True)
class Dependency:

    """
    Represents a dependency
    """

    name: str

    current_version: str