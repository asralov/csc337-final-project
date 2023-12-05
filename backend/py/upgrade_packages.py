# Author: Ryder Rhoads
# File: update_packages.py
# Description: This file updates all packages in the virtual environment.
import pkg_resources
from subprocess import call

packages = [dist.project_name for dist in pkg_resources.working_set]
call("pip install --upgrade " + ' '.join(packages), shell=True)
