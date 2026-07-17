from app.clients.npm_registry_clients import NpmRegistryClient
from app.enums.project_types import ProjectType

class RegistryClientFactory:

    _CLIENTS = {
        ProjectType.NODE : NpmRegistryClient
    }

    @classmethod
    def get_client(cls, project_type):

        client = cls._CLIENTS.get(project_type)

        if client is None:
            raise ValueError(f"Client not found for project type {project_type}")

        return client