from pathlib import Path
import shutil
import subprocess
from git import Repo

class RepositoryManager:

    BASE_DIR = Path('temp_repos')

    @classmethod
    def initialize(cls):
        """
        Creates a temp repos directory if it already doesnot exists
        """

        cls.BASE_DIR.mkdir(parents=True, exist_ok=True)

    @classmethod
    def get_local_path(cls, owner, repository):
        """
        Returns the local path of the repository
        """

        return cls.BASE_DIR / f"{owner}/{repository}"
    
    @classmethod
    def repository_exists(cls, owner, repository):
        """
        Returns True if the repository exists
        """

        return cls.get_local_path(owner, repository).exists()
    
    @classmethod
    def clone_repository(cls, clone_url, owner, repository):
        """
        Clone the repository and return it s local path
        """

        local_path = cls.get_local_path(owner, repository)

        if local_path.exists():
            return local_path

        # This part of code is like shell scripting and as my project revolve aroung git i have used an alternative known as
        # GitPython due to which i am clearly able to use my command in a more compact way.

        # subprocess.run(
        #     [
        #         "git",
        #         "clone",
        #         clone_url,
        #         str(local_path)
        #     ],
        #     check=True
        # )

        Repo.clone_from(clone_url, str(local_path))

        return local_path
    
    @classmethod
    def delete_repository(cls,owner,repository):
        """
        Delete the cloned repository
        """

        local_path = cls.get_local_path(owner, repository)

        if local_path.exists():
            shutil.rmtree(local_path)