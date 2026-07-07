import jwt

from datetime import datetime, timedelta
from flask import current_app


class JWTHandler:

    @staticmethod
    def generate_token(user):
        payload = {
            "user_id" : str(user['_id']),
            "exp":datetime.utcnow() + timedelta(days=7)
        }

        return jwt.encode(
            payload,
            current_app.config["JWT_SECRET"],
            algorithm="HS256"
        )