import requests

from app.exceptions.custom_exception import ExternalException
from app.clients.base_registry_client import BaseRegistryClient

class NpmRegistryClient(BaseRegistryClient):

    BASE_URL = "https://registry.npmjs.org"

    @classmethod
    def get_package(self, dependency):

        try:
            response = requests.get(
                f"{self.BASE_URL}/{dependency.name}",
                timeout=10
            )

            response.raise_for_status()

            return response.json()
        
        except requests.RequestException as e:

            raise ExternalException (
                f"Unable to fetch '{dependency.name}' from npm."
            )from e