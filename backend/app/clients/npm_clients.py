import requests

class NpmClient:

    BASE_URL = "https://registry.npmjs.org"

    def get_package(self, package_name):

        response = requests.get(
            f"{self.BASE_URL}/{package_name}",
            timeout=10
        )

        response.raise_for_status()

        data = response.json()

        latest = data['dist-tags']['latest']

        latest_data = data['versions'][latest]

        return {

            "latest_version": latest,

            "description": latest_data.get("description", ""),

            "homepage": latest_data.get("homepage", ""),

            "repository": (
                latest_data.get("repository", {})
                .get("url", "")
                if isinstance(latest_data.get("repository"), dict)
                else ""
            ),

            "license": latest_data.get("license", "")
        }

