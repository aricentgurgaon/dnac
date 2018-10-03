
from flask import Flask
from flask import request
from flask import jsonify


import argparse
import getpass
import logging
import os
import sys
import traceback
import pkg_resources
import json

from jsondiff import diff


from wallet.simplewallet_client import SimpleWalletClient
#from sawooth_signing import create_context
#from sawtooth_signing import CryptoFactory



import hashlib
import base64
import random
import requests
import yaml

from sawtooth_signing import create_context
from sawtooth_signing import CryptoFactory
from sawtooth_signing import ParseError
from sawtooth_signing.secp256k1 import Secp256k1PrivateKey

from sawtooth_sdk.protobuf.transaction_pb2 import TransactionHeader
from sawtooth_sdk.protobuf.transaction_pb2 import Transaction
from sawtooth_sdk.protobuf.batch_pb2 import BatchList
from sawtooth_sdk.protobuf.batch_pb2 import BatchHeader
from sawtooth_sdk.protobuf.batch_pb2 import Batch




DISTRIBUTION_NAME = 'simplewallet'

DEFAULT_URL = 'http://rest-api:8008'

app = Flask(__name__)



def _get_keyfile(customerName):
    '''Get the private key for a customer.'''
    home = os.path.expanduser("~")
    key_dir = os.path.join(home, ".sawtooth", "keys")

    return '{}/{}.priv'.format(key_dir, customerName)


#abhishek
def _generate_keys(deviceId):
    '''Generate keys for a customer.'''
    context = create_context('secp256k1')
    private_key = context.new_random_private_key()
    signer = CryptoFactory(context).new_signer(private_key)
    private_key_hex=private_key.as_hex()
    print(private_key_hex)
    public_key_hex=signer.get_public_key().as_hex()
    print(public_key_hex)
    home = os.path.expanduser("~")
    key_dir = os.path.join(home, ".sawtooth", "keys")
    priv_key_file='{}/{}.priv'.format(key_dir, deviceId)
    pub_key_file='{}/{}.pub'.format(key_dir, deviceId)
    f=open(priv_key_file, 'w')
    f.write(private_key_hex)
    f.close()
    f=open(pub_key_file, 'w')
    f.write(public_key_hex)
    f.close()
    
    #return private_key


@app.route("/", methods=['POST'])
def post():
    print(request.json)
    return "hello"






#abhishek
#@app.route("/traverse/<blockID>",methods=['POST'])
#def traverseBlocks():
     





#abhishek
#add DNA block
#create block
#@app.route("/createBlock/<blockName>",methods=['POST'])
#def createBlock(blockName):
#    if not request.json:
#        return "Syntax Error", 400   
    
#    keyfile = _get_keyfile(blockName)
#    if not os.path.exists(keyfile):
#        _generate_keys(blockName)
#        keyfile = _get_keyfile(blockName)

#    client = SimpleWalletClient(baseUrl=DEFAULT_URL, keyFile=keyfile)
#    response = client.update(json.dumps(request.json))
#    print("Response: {}".format(response))
    
#    return response
###########################


#abhishek
#add block
#@app.route("/update",methods=['POST'])
#def addToBlock():
#    print(request.json)
#    if not request.json:
#        return "Syntax Error", 400
#
#    flag = 0
#    deviceId = request.json['id']
#
#    keyfile = _get_keyfile(deviceId)
#    if not os.path.exists(keyfile):
#        _generate_keys(deviceId)
#        keyfile = _get_keyfile(deviceId)
#        flag = 1
#    client = SimpleWalletClient(baseUrl=DEFAULT_URL, keyFile=keyfile)
#    response = client.update(json.dumps(request.json))
#    #response = client.update("DNAC chalega")
#    print("Response: {}".format(response))
#    if flag == 1:
#        return "New Block Created" 
#    if flag == 0:
#        return "Record Added to Blockchain"




@app.route("/test")
def get():
    return "hello"






#abhishek
@app.route("/traverse/<deviceID>",methods=['GET'])
def traverseBlocks(deviceID):
     
    keyfile = _get_keyfile(deviceID)

    if not os.path.exists(keyfile):
        res = {"status" : True, "msg" : "No Blocks exists for the given ID."}

    else:
        client = SimpleWalletClient(baseUrl=DEFAULT_URL, keyFile=keyfile)
        #address = client.getAddress()
        fetchedDataResponse = client.getAllData()
        print("\n\n Fetched Data")
        print(fetchedDataResponse)
        res = {"status" : True, "msg" : "Block(s) found for the given ID."} 
       
        #for x in fetchedDataResponse['data']:
        #    payload = fetchedDataResponse['batches']['transactions']['payload'] :    


#    return json.dumps(fetchedDataResponse)
#    print("Abhishek Chagaya") 
#    print(json.loads(fetchedDataResponse))
 #   print(jsonify(fetchedDataResponse))
#    return jsonify(fetchedDataResponse) 
#    return (json.loads(fetchedDataResponse))
    return jsonify(json.loads(fetchedDataResponse))
 


#abhishek
#check delta and add
@app.route("/update",methods=['POST'])
def update():
    if not request.json:
        return "Syntax Error", 400
    #print(request.json)

    flag = 0
    res = {}
    res = {"status" : False, "msg" : "No Changes Found"}

    deviceId = request.json["id"]

    keyfile = _get_keyfile(deviceId)


    if not os.path.exists(keyfile):
        _generate_keys(deviceId)
        keyfile = _get_keyfile(deviceId)
        client = SimpleWalletClient(baseUrl=DEFAULT_URL, keyFile=keyfile)
        response = client.update(json.dumps(request.json))
        #print("Response: {}".format(response))
        flag = 1
        print("\n\nNew Block Created")
        res = {"status" : True, "msg" : "New Block Created"}

        #return "New Block Created"

        
    else:
        client = SimpleWalletClient(baseUrl=DEFAULT_URL, keyFile=keyfile)
        response = client.balance()
    
        #now find the delta and if delta exists add to chain

        #compare response and request.jsoni
       
        #if (len(diff(request.json,response)) != 0):        
        if (len(diff(request.json,json.loads(response))) != 0):        
            #print(request.json)
            #print("\n\n")
            #print(json.loads(response))
            print(len(diff(request.json,json.loads(response))))
            flag = 1 
            client = SimpleWalletClient(baseUrl=DEFAULT_URL, keyFile=keyfile)
            response = client.update(json.dumps(request.json))
            print("\n\nRecord Added to Blockchain")
            res = {"status" : True,"msg" : "Record Added to Blockchain"}
            #return json.dumps(res)         

    if flag != 1:
        print("\n\nNo changes found")

    return json.dumps(res)


#get block
@app.route("/getDevice/<name>", methods=['GET'])
def getName(name):
    keyfile = _get_keyfile(name)
    if not os.path.exists(keyfile):
        _generate_keys(name)
        keyfile = _get_keyfile(name)

    client = SimpleWalletClient(baseUrl=DEFAULT_URL, keyFile=keyfile)

    response = client.balance()
    #response = client.update("DNAC chalega")
    #print("Response: {}".format(response))

    #temp = json.loads((response.decode('utf8').replace("'", '"')))

    #print(temp)
    #return temp
    #return jsonify(response)
    print(response)

    return response
    #return "{}".format(response)
     



if __name__ == '__main__':
    app.run(ssl_context=('cert.pem', 'key.pem'),debug=True, host='0.0.0.0')
