from functools import wraps
from flask import request, g

from app.auth.jwt_handler import JWTHandler
from app.models.user_model import UserModel
from app.exceptions.custom_exception import AuthenticationError



def login_required(func):
    @wraps(func)
    def wrap(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header :
            raise AuthenticationError("Authorization header not found")
        
        parts = auth_header.split(' ')

        if len(parts) != 2:
            raise AuthenticationError("Invalid authorization header")
        
        if not auth_header.startswith('Bearer'):
            raise AuthenticationError("Invalid authorization header")
        
        token = parts[1]

        payload = JWTHandler.verify_token(token)

        user = UserModel.find_by_id(payload['user_id'])

        if not user:
            raise AuthenticationError("User not found")

        g.current_user = user

        return func(*args, **kwargs)
    
    return wrap
    