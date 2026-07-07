from datetime import datetime
from dataclasses import dataclass, field
from typing import Optional

@dataclass
class User:

    github_id: int

    username: str

    email: Optional[str]

    avatar: str

    github_token: str

    created_at: datetime = field(default_factory=datetime.utcnow)

    last_login: datetime = field(default_factory=datetime.utcnow)