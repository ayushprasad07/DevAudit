from flask import Blueprint, request, redirect, jsonify
from app.github.auth import GithubAuth

github_bp = Blueprint('github', __name__)

@github_bp.route("/auth/github")
def github_login():

    return redirect(GithubAuth.get_auth_url())


@github_bp.route("/auth/github/callback")
def github_callback():

    code  = request.args.get("code")

    if not code:
        return jsonify({
            "status" : "false",
            "message" : "Authorization code not found"
        }), 400
    
    access_token = GithubAuth.get_access_token(code)

    return jsonify(access_token)