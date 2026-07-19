from enum import Enum


class UpdateType(Enum):

    MAJOR = "major"

    MINOR = "minor"

    PATCH = "patch"

    NONE = "none"

    UNKNOWN = "unknown"