from app.auth.jwt_handler import JWTHandler

class SessionService:

    @staticmethod
    def create_session(user):
        token = JWTHandler.generate_token(user)

        return {
            "access_token" : token,
            "token_type" : "Bearer"
        }