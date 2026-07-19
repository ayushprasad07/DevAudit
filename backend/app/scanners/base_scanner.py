from abc import ABC, abstractmethod


class BaseScanner (ABC): 

    @abstractmethod
    def scan(self, repository_path):
        pass