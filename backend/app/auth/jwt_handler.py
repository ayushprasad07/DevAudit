import jwt

from datetime import datetime, timedelta
from flask import current_app

from app.exceptions.custom_exception import AuthenticationError


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
    
    @staticmethod
    def verify_token(token):

        try:

            return jwt.decode(
                token,
                current_app.config['JWT_SECRET'],
                algorithms= ['HS256']
            )
        
        except jwt.ExpiredSignatureError:

            raise AuthenticationError("Token expired.")

        except jwt.InvalidTokenError:

            raise AuthenticationError("Invalid token.")