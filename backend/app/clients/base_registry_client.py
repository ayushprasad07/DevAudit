from abc import ABC, abstractmethod


class BaseRegistryClient(ABC):

    @abstractmethod
    def get_package(self, dependency):
        """
        Fetch metadata for a dependency from the package registry.
        """
        pass