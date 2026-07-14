from abc import ABC, abstractmethod


class BaseClass (ABC): 

    @abstractmethod
    def scan(self, repository_path):
        pass