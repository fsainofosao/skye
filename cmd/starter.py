import os
import json

with open("../config.json", "r") as f:
    config = json.load(f)

path = config["kontrolpanel_serverpath"]
os.system("start cmd /k && start C:\\Users\\Zuntie\\Documents\\Developer\\FXServer\\Starter.bat")
