from urllib.parse import urlparse

class GitHubRepository:
    def __init__(self,url : str):
        self.url = url

        parsed = urlparse(url)

        if parsed.scheme != "https":
            raise ValueError("Github Repository url must be http.")

        if parsed.netloc.lower() != "github.com":
            raise ValueError("Repository must be hosted on github.")

        parts = [
            part
            for part in parsed.path.strip("/").split("/")
            if part
        ]

        if len(parts) !=2 :
            raise ValueError("Invalid github repository url.")

        self.owner = parts[0]
        self.repository = parts[1]

        if self.repository.endswith(".git"):
            self.repository = self.repository[:-4]