import os
import json
import yaml
import base64
from pprint import pprint


os.system("curl http://rest-api:8008/blocks > result.txt")

jsonData = {}

with open("result.json","r") as d:
    jsonData = json.load(d)

print(json.loads(base64.b64decode(yaml.safe_load(jsonData)["data"]).decode('UTF-8')))
