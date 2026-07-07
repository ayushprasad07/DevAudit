import requests


class GitHubClient:

    BASE_URL = "https://api.github.com"

    def __init__(self, access_token):

        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github+json"
        }

    def get_authenticated_user(self):

        response = requests.get(
            f"{self.BASE_URL}/user",
            headers=self.headers
        )

        response.raise_for_status()

        return response.json()