import requests
from flask import current_app
from urllib.parse import urlencode


class GithubAuth:

    @staticmethod
    def get_auth_url():

        params = {
            "client_id" : current_app.config["GITHUB_CLIENT_ID"],
            "scope" : "repo repo:user user:email",
            "redirect_uri" : current_app.config["GITHUB_REDIRECT_URI"]
        }

        return f'https://github.com/login/oauth/authorize?{urlencode(params)}'
    
    @staticmethod
    def get_access_token(code):

        url = 'https://github.com/login/oauth/access_token'

        params = {
            "client_id" : current_app.config["GITHUB_CLIENT_ID"],
            "client_secret" : current_app.config["GITHUB_CLIENT_SECRET"],
            "code" : code,
            "redirect_uri" : current_app.config["GITHUB_REDIRECT_URI"]
        }

        headers = {
            "Accept" : "application/json"
        }

        response = requests.post(url, params=params, headers=headers)

        return response.json()