import json
from pathlib import Path

class FileReader:

    @staticmethod
    def read_json(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
        
    @staticmethod
    def exists(file_path):

        return Path(file_path).exists()