from dataclasses import asdict, is_dataclass
from enum import Enum


def serialize(obj):

    if isinstance(obj, Enum):
        return obj.value

    if is_dataclass(obj):
        return serialize(asdict(obj))

    if isinstance(obj, dict):
        return {
            key: serialize(value)
            for key, value in obj.items()
        }

    if isinstance(obj, list):
        return [serialize(item) for item in obj]

    return obj