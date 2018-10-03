import json
from jsondiff import diff




json1 = {
    "tags": [],
    "id": "4757da48-3730-4833-86db-a0ebfbdf0009",
    "customParam": {},
    "ip": "10.10.22.70",
    "softwareVersion": "16.6.1",
    "role": "ACCESS",
    "deviceType": "Cisco Catalyst 9300 Switch",
    "platformId": "C9300-24UX",
    "nodeType": "device",
    "additionalInfo": {
        "latitude": "-33.837053",
        "macAddress": "f8:7b:20:71:4d:80",
        "siteid": "5f0c35d5-bc8f-4923-97e7-51a530393d15",
        "longitude": "151.206266"
    },
    "family": "Switches and Hubs",
    "roleSource": "AUTO",
    "label": "cat_9k_2.abc.inc"
}

json2 = {
    "tags": [],
    "id": "4757da48-3730-4833-86db-a0ebfbdf0009",
    "customParam": {},
    "ip": "10.10.22.70",
    "softwareVersion": "16.6.1",
    "role": "ACCESS",
    "deviceType": "Cisco Catalyst 9300 Switch",
    "platformId": "C9300-24UX",
    "nodeType": "device",
    "additionalInfo": {
        "latitude": "-33.837053",
        "macAddress": "f8:7b:20:71:4d:80",
        "siteid": "5f0c35d5-bc8f-4923-97e7-51a530393d15",
        "longitude": "151.206266"
    },
    "family": "Switches and Hubs",
    "roleSource": "AUTO",
    "label": "cat_9k_2.abc.inc"
}


if __name__ == '__main__':
    print(diff(json1,json2))
    print(len(diff(json1,json2)))