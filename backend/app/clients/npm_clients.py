import requests

from app.exceptions.custom_exception import ExternalException

class NpmClient:

    BASE_URL = "https://registry.npmjs.org"

    @classmethod
    def get_package(self, package_name):

        try:
            response = requests.get(
                f"{self.BASE_URL}/{package_name}",
                timeout=10
            )

            response.raise_for_status()

            return response.json()
        
        except requests.RequestException as e:

            raise ExternalException (
                f"Unable to fetch '{package_name}' from npm."
            )from e