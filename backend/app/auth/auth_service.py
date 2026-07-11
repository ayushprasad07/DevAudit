from app.auth.session_service import SessionService
from app.entity.user import User
from app.github.auth import GithubAuth
from app.github.client import GitHubClient
from app.models.user_model import UserModel

class AuthService:

    @staticmethod
    def login(code):

        access_token = AuthService._exchange_code_for_token(code)

        github_user = AuthService._get_github_user(access_token)

        user = AuthService._find_or_create_user(github_user, access_token)

        session = AuthService._create_session(user)

        return AuthService._build_response(
            user, 
            session
        )
    
    @staticmethod
    def _exchange_code_for_token(code):

        return GithubAuth.get_access_token(code)['access_token']
    
    @staticmethod
    def _get_github_user(access_token):

        client = GitHubClient(access_token)

        return client.get_authenticated_user()
    
    @staticmethod
    def _find_or_create_user(github_user, access_token):

        existing_user = UserModel.find_by_github_id(
            github_user["id"]
        )

        if existing_user:

            UserModel.update(
                str(existing_user["_id"]),
                {
                    "github_token": access_token,
                }
            )

            UserModel.update_last_login(
                str(existing_user["_id"])
            )

            return UserModel.find_by_id(
                str(existing_user["_id"])
            )

        user = User(

            github_id=github_user["id"],

            username=github_user["login"],

            email=github_user.get("email"),

            avatar=github_user["avatar_url"],

            github_token=access_token

        )

        return UserModel.create(user)
    
    @staticmethod
    def _create_session(user):

        return SessionService.create_session(user)
    
    @staticmethod
    def _build_response(user, session):

        return {

            "success": True,

            "message": "Login Successful",

            "data": {

                "user": {

                    "id": str(user["_id"]),

                    "github_id": user["github_id"],

                    "username": user["username"],

                    "email": user["email"],

                    "avatar": user["avatar"]

                },

                "session": session

            }

        }