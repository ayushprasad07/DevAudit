from flask import Blueprint, request, redirect, jsonify
from app.github.auth import GithubAuth

from app.exceptions.custom_exception import AuthenticationError

from app.auth.auth_service import AuthService

github_bp = Blueprint('github', __name__)

@github_bp.route("/auth/github")
def github_login():

    return redirect(GithubAuth.get_auth_url())


@github_bp.route("/auth/github/callback")
def github_callback():

    code  = request.args.get("code")

    if not code:
        raise AuthenticationError("Authentication Code not found")
    
    result = AuthService.login(code)

    return jsonify(result)