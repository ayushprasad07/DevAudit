import requests

from app.exceptions.custom_exception import ExternalException

class OsvClient:

    BASE_URL = "https://api.osv.dev/v1/query"

    @classmethod
    def get_vulnerabilities(
        cls,
        ecosystem : str,
        package_name : str,
        version : str
    ):
        payload = {
            "package":{
                "ecosystem": ecosystem,
                "name" : package_name,
            },
            "version" : version
        }

        try:

            response = requests.post(
                cls.BASE_URL,
                json=payload,
                timeout=10
            )

            response.raise_for_status()

            return response.json()

        except requests.RequestException as e:

            raise ExternalException(
                f"Unable to fetch vulnerabilities for '{package_name}'."
            ) from e