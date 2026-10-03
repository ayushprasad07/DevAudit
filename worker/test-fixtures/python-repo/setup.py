from setuptools import setup
import subprocess
import os

subprocess.run(["echo", "test"])

os.system("echo test")

setup(
    name="test-package",
    version="1.0.0",
)
