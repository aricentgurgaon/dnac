'use strict';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

const https		= require("https"), fs = require("fs"), cors = require("cors");
var express 	= require('express');
var beautify 	= require('js-beautify').js_beautify;
var bodyParser 	= require('body-parser');
var httpUtility = require('./http_utility');
var diff 		= require('./diff');
var mongo 		= require('./mongo');
var poller 		= require('./polling');
var app 		= express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const options = {
  key: fs.readFileSync("ryans-key.pem"),
  cert: fs.readFileSync("ryans-cert.pem"),
  requestCert: false,
  rejectUnauthorized: false
};

app.use(cors({
	exposedHeaders: '*',
}))

// var allowCrosDomain = function (req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
// 	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// };
// app.use(allowCrosDomain);

var token 					= undefined;
var dnaConfig 				= undefined;
var blockchainConfig 		= undefined;
const config_Collection		= 'config';
const template_Collection 	= 'template';
const assets_Collection 	= 'assets';

const SPARK_ROOM_ID = 'Y2lzY29zcGFyazovL3VzL1JPT00vNmY5ODRjNTAtYmIwNi0xMWU4LTlmNzgtY2ZkNmJiM2UzZWQ5';
/*********************************API Endpoints*************************************************/
    /*CRUD API for DNA Config's*/

app.get('/eam/v1/dna/:dnaId/poll', function (req, res) {
	var option	 = req.query.option;
	var deviceId = req.query.id;
	var dnaId 	 = req.params.dnaId;

	if(dnaConfig === undefined || dnaId != dnaConfig['_id']){
		console.log('Config not present, fetching from Mongo DB for dna Id : '+dnaId);
		fetchConfig(dnaId,function(result,status){

			if(result != null && result != undefined){
				if(status == true){
					dnaConfig = result['dna'];
					blockchainConfig = result['blockchain'];
					fetchToken(function (token,status,error){
						if(status == true){
							poller.startPolling(dnaConfig.host,option,deviceId,token,function(result,status,returnResponse){
								if(returnResponse){
									sendResponse(res,200,result);
								}else{
									console.log('Find difference');
									publishToBlockChain(result.response);
								}
							});
						}
					});
				}else{
					sendResponse(res,500,result);	
				}
			}else{
				sendResponse(res,500,{'status':'No config found for dna id : '+dnaId});	
			}
		});
	}else{
		fetchToken(function (token,status,error){
			if(status == true){
				poller.startPolling(dnaConfig.host,option,deviceId,token,function(result,status,returnResponse){
					if(returnResponse){
						sendResponse(res,200,result);
					}else{
						console.log('Find difference');		
						publishToBlockChain(result.response);
					}		
				});
			}
		});
	}
});

app.get('/eam/v1/dna/:dnaId/audit', function (req, res) {
	var deviceId = req.query.deviceId;
	var dnaId    = req.params.dnaId;

	if(dnaConfig === undefined || dnaId != dnaConfig['_id']){
		console.log('Config not present, fetching from Mongo DB for dna Id : '+dnaId);
		fetchConfig(dnaId,function(result,status){
			if(result != null && result != undefined){
				if(status == true){
					dnaConfig = result['dna'];
					blockchainConfig = result['blockchain'];
					getAuditTrail(deviceId,res);
				}else{
					sendResponse(res,500,result);	
				}
			}else{
				sendResponse(res,500,{'status':'No config found for dna id : '+dnaId});	
			}
		});
	}else{
		getAuditTrail(deviceId,res);
	}
});

app.get('/eam/v1/dna/:dnaId/event/:eventid/stopPolling', function (req, res) {
	var deviceId = req.params.eventid;
	poller.stopPolling(deviceId,function(result,status){
		sendResponse(res,200,result);	
	});
});

/*CRUD API for DNA Config's*/
app.all('/eam/v1/dna/asset', function (req, res) {
	var assetId = req.query.assetId;
	switch (req.method) {
	case 'GET':
		if(assetId != undefined){
			getConfig(res,assetId,assets_Collection);
		}else{
			getAllConfig(res,assets_Collection);
		}
        break;
    case 'POST':
        setConfig(req,res,assetId,assets_Collection);
        break;
	case 'PUT':
		setConfig(req,res,assetId,assets_Collection);
        break;
	case 'DELETE':
        deleteConfig(res,assetId,assets_Collection);
        break;
    default:
		sendResponse(405,{'status': 'HTTP method not supported'});
	} 
});

/*CRUD API for Complianace Templates*/
app.all('/eam/v1/dna/template', function (req, res) {
	var templateId = req.query.templateId;
	switch (req.method) {
	case 'GET':
		if(templateId != undefined){
			getConfig(res,templateId,template_Collection);
		}else{
			getAllConfig(res,template_Collection);
		}
        break;
    case 'POST':
        setConfig(req,res,templateId,template_Collection);
        break;
	case 'PUT':
		setConfig(req,res,templateId,template_Collection);
        break;
	case 'DELETE':
        deleteConfig(res,templateId,template_Collection);
        break;
    default:
		sendResponse(405,{'status': 'HTTP method not supported'});
	} 
});

/*CRUD API for DNA Config's*/
app.all('/eam/v1/dna/:dnaId/config', function (req, res) {
	
	var dnaId = req.params.dnaId;
	switch (req.method) {
	case 'GET':
		getConfig(res,dnaId,config_Collection);
        break;
    case 'POST':
        setConfig(req,res,dnaId,config_Collection);
        break;
	case 'PUT':
		setConfig(req,res,dnaId,config_Collection);
        break;
	case 'DELETE':
        deleteConfig(res,dnaId,config_Collection);
        break;
    default:
		sendResponse(res,405,{'status': 'HTTP method not supported'});
	} 
});

/*get all configs stored in DB*/
app.get('/eam/v1/dna/config',function (req, res){
	getAllConfig(res,config_Collection);
});

/*Discover all interfaces in the DNA network*/
app.get('/eam/v1/dna/:dnaId/topology', function (req, res) {

	authorizeAndCallApi(res,req.params.dnaId, null,'TOPOLOGY');
});

/*Discover all interfaces in the DNA network*/
app.get('/eam/v1/dna/:dnaId/interfaces', function (req, res) {
	authorizeAndCallApi(res,req.params.dnaId, null,'INTERFACES');
});

/*Discover all devices in the DNA network*/
app.get('/eam/v1/dna/:dnaId/devices', function (req, res) {
	authorizeAndCallApi(res,req.params.dnaId, null,'DEVICES');
});

/*GET/UPDATE API to get and update device details*/
app.all('/eam/v1/dna/:dnaId/device/:deviceId', function (req, res) {
	
	var dnaId	 = req.params.dnaId;
	var deviceId = req.params.deviceId;
	var endPoint = undefined;

	switch (req.method) {
	case 'GET':
		endPoint = 'DEVICE_BY_ID';
        break;
	case 'PUT':
		endPoint = 'DEVICES';
        break;
    default:
		sendResponse(res,405,{'status': 'HTTP method not supported'});
	}
	authorizeAndCallApi(res,dnaId, deviceId,endPoint);
});

/*GET Delta for the device data saved*/
app.get('/eam/v1/:dnaId/device/{deviceId}/config-delta', function (req, res) {
	var dnaId 	 = req.params.dnaId;
	var deviceId = req.params.deviceId;
});

/************************Publish block to blockchain**************************************/
var getAuditTrail = function (deviceId, res) {

	var host 	= blockchainConfig.host;
	var api  	= '/traverse/'+deviceId;
	var method 	= 'GET';
	var port    = 5000;
    var headers = {
        'Content-Type': 'application/json; charset=utf-8'
    };
	
	httpCall(host, api, port, method, null, headers, function (result,status){;
		if(status == true){
			sendResponse(res,200,result);
		}else{
			sendResponse(res,500,result);
			console.log('Get audit trail failed : : '+result);
		}
	});
}

var publishToBlockChain = function (block) {

	console.log('Block to be posted : '+JSON.stringify(block.response));
	var host 	= blockchainConfig.host;
	var api  	= '/update';
	var method 	= 'POST';
    var headers = {
        'Content-Type': 'application/json; charset=utf-8'
    };
	
	httpCall(host, api,null,method,block,headers, function (result,status){;
		if(status == true){
			sendSparkMessage(SPARK_ROOM_ID, JSON.stringify(result));
			console.log('Publish to blockchain response : : '+JSON.stringify(response));
		}else{
			console.log('Publish to blockchain failed : : '+result);
		}
	});
}

/************************Send Spark message**************************************/
var sendSparkMessage = function (roomId, message) {
	console.log('send message called');
    var host = 'api.ciscospark.com';
    var endpoint = '/v1/messages';

	console.log('message to be send in spark room :' +message);
    var data = {
        roomId: roomId,
        text: message
    };

    var method = 'POST';
    var headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': 'Bearer ' + 'YWUzN2IxODMtYjE2Zi00NWZlLTg5YTctNWY2OTZiZmY3YTA2MWZkMzkyZjctZDcy'
    };
	httpCall(host, api,null,'POST',data,headers, function (result,status){;
		if(status == true){
			sendResponse(res,200,result);
		}else{
			sendResponse(res,500,result);
		}
	});
};

/**********************************************************************************/
var httpCall = function (host,api,port,method,data,headers,callback){
	
	var error = function (data) {
		callback({'status': 'Error in executing api : '+data},false);
	};

	var success = function (data) {
		try {
			var response = JSON.parse(data.response);
			if(response.response == undefined){
				callback(response,true);
			}else{
				callback(response.response,true);
			}
		} catch (e) {
			callback(e,true);
		}
	}
	makeHttpRequest(host,
		port,
		api,
		headers,
		method,
		data,
		success,
		error
	);
}

var getQuery = function (host,api,callback){
	var headers = {
		'Content-Type': 'application/json; charset=utf-8',
		'x-auth-token': token
	};
	
	var error = function (data) {
		callback({'status': 'Error in getting getQuery API response : '+data},false);
	};

	var success = function (data) {
		try {
			var response = JSON.parse(data.response);
			callback(response.response,true);
		} catch (e) {
			console.log('\nError in getting getQuery API response : ' + e.errmsg);
			callback({'status': e.errmsg},false);
		}
	}
	makeHttpRequest(host,
		null,
		api,
		headers,
		'GET',
		null,
		success,
		error
	);
}

/**********************************************************************************/
var deleteConfig = function (res,dnaId,collection){	
	mongo.insertDocument(collection,jsonObj,function(result,success){
		if(success == true){
			sendResponse(res,200,'Config deleted successfully');
		}else{
			sendResponse(res,500,{ 'status': result.errmsg});	
		}
	});
}

var getAllConfig = function (res,collection){
	mongo.getAllDocuments(collection,function(result,success){	
		if(success == true){
			sendResponse(res,200,result);
		}else{
			if(IsJsonString(result)){
				sendResponse(res,500,result);	
			}else{
				sendResponse(res,500,{ 'status': result.errmsg});	
			}
		}	
	});
}

var getConfig = function (res,id,collection){

	mongo.getDocumentById(collection,id,function(result,success){	
		if(success == true){
			sendResponse(res,200,result);
		}else{
			if(IsJsonString(result)){
				sendResponse(res,500,result);	
			}else{
				sendResponse(res,500,{ 'status': result.errmsg});	
			}
		}	
	});
}

var setConfig = function (req,res,id,collection){
	if(req.body != undefined){
		var jsonObj = req.body;
		var status  = false;
		jsonObj['_id'] = id;
		
		mongo.upsertDocumentById(collection,id,jsonObj,function(result,success){
			if(success == true){
				sendResponse(res,200,{ 'status': 'Config saved successfully'});
			}else{
				sendResponse(res,500,{ 'status': result.errmsg});	
			}
		});
	}else{
		sendResponse(res,400,{ 'status': 'Bad Request, request body no found'});	
	}
}

var updateConfig = function (req,res,id,collection){
	if(req.body != undefined){
		var jsonObj = req.body;
		jsonObj['_id'] = id;
		console.log('Update body : '+jsonObj);
		
		mongo.updateDocumentById(collection,id,jsonObj,function(result,success){
			if(success == true){
				sendResponse(res,200,result);
			}else{
				sendResponse(res,500,{'status': result.errmsg});	
			}
		});
	}else{
		sendResponse(res,400,{'status': 'Bad Request, request body no found'});	
	}
}

/**********************************************************************************/
function authorizeAndCallApi(res,dnaId, deviceId, api_Id){
	//If no cached config present then fetch config from MongoDB//
	if(dnaConfig === undefined || dnaId != dnaConfig['_id']){
		console.log('Config not present, fetching from Mongo DB for dna Id : '+dnaId);
		fetchConfig(dnaId,function(result,status){
			if(result != null && result != undefined){
				if(status == true){
					console.log('Config found for id : '+dnaId);
					
					dnaConfig = result['dna'];
					blockchainConfig = result['blockchain'];
					fetchToken(function (token,status,error){
						if(status == true){
							callAPI(dnaConfig.host, api_Id, dnaId, deviceId, res);
						}
					});
				}else{
					sendResponse(res,500,result);	
				}
			}else{
				sendResponse(res,500,{'status':'No config found for dna id : '+dnaId});	
			}
			
		});
	}else{
		fetchToken(function (token,status,error){
			if(status == true){
				callAPI(dnaConfig.host, api_Id, dnaId, deviceId, res);
			}
		});
	}
}

function fetchConfig(dnaId,callback){
	console.log('\nFetching config for DNA ID : '+dnaId);
	mongo.getDocumentById(config_Collection,dnaId,function(result,success){	
		if(success == true){
			callback(result,true);
		}else{
			callback({ 'status': 'Cannot fetch token as no config present for dna id : '+dnaId},false);	
		}	
	});
}

function fetchToken(callback){
        
	//If token is cached then call api//
	let host = dnaConfig.host;

	if (hasValue(token) === true){
		console.log('\nToken Present');
		callback(token,true,undefined);
		return;
	}
	console.log('\nToken not present calling DNA controller APi to get token');
	//Else token first using saved config then call API//
	var auth     = 'Basic ' + Buffer.from(dnaConfig.username + ':' + dnaConfig.password).toString('base64');
	let endpoint = '/api/system/v1/auth/token';
	let method   = 'POST';
	
	var headers = {
		'Content-Type': 'application/json; charset=utf-8',
		'Authorization': auth
	};

	var error = function (data) {
		console.error('Token error : '+ data);
		callback(token,false,data);
	};

    var success = function (data) {
        try {
			if(hasValue(token) === false){
				var tokenJson = JSON.parse(data.response);
				token = tokenJson.Token;
				console.log('\nToken  Found');
				callback(token,true,undefined);
			}
	    } catch (e) {
			console.log('\nFetch token error : ' + e.errmsg);
			callback(token,false,e);
        }
    };
	makeHttpRequest(host,null,endpoint,headers,method,null,success,error);
}

/********************************Helper Methods*****************************************/
function makeHttpRequest(host,port,api,headers,method,data,successCallback,errorCallback){
	
	console.log('\n*****************************API REQUEST*******************************');
	console.log('host 	: ' + host);
	console.log('api 	: ' + api);
	console.log('method	: ' + method);
	console.log('***********************************************************************');
	
	var request = {
		host: host,
		port:port,
		endpoint: api,
		headers: headers,
		method: method,
		data: data,
		success: successCallback,
		error: errorCallback
	};
	httpUtility.performRequest(request);
}

function callAPI(host, api_id, dnaId, deviceId, res){
	
	var api = undefined;

	switch (api_id) {
    case 'DEVICE_BY_ID':
		api = '/api/v1/network-device/'+deviceId;
		break;
		case 'TOPOLOGY':
		api = '/api/v1/topology/physical-topology';
        break;
	case 'DEVICES':
		api = '/api/v1/network-device/?limit=10&offset=1&sortBy=managementIpAddress&order=asc';
        break;
	case 'INTERFACES':
		api = '/api/v1/interface';
        break;
    default:
		sendResponse(res,405,{'status': 'HTTP method not supported'});
	}

	var headers = {
		'Content-Type': 'application/json; charset=utf-8',
		'x-auth-token': token
	};
	httpCall(host, api,null,'GET',null,headers, function (result,status){;
		if(status == true){
			sendResponse(res,200,result);
		}else{
			sendResponse(res,500,result);
		}
	});
}
function writeDataToFile(data,file){
	var success = true;
	fs.writeFile(file, data, 'utf8', function (err) {
		if (err) {
			success = false;
		}
	});
	return success
}


function returnIfParamsNotPresent(res, id, id_name){
	if (!id){
		var response = {'status' : 'Bad request, requited param not present : ' + id_name};
		sendResponse(res, 400, response);
	}
}

function logJsonResponse(message, data){	
	var beautifyOptions = {
                    indent_size: 2,
                    indent_char: " "
                };
    console.log(message +'\n'+ beautify(data, beautifyOptions));
}

function sendResponse(res, statusCode, data){	
	var beautifyOptions = {
                    indent_size: 2,
                    indent_char: " "
                };
	var jsonContent = JSON.stringify(data);
    console.log('Response : ' + beautify(jsonContent, beautifyOptions));
	res.status(statusCode).json(data);
}

function readJsonFile(fileName) {
	
	if (fs.existsSync(fileName)) {
		let rawdata = fs.readFileSync(fileName);  
		let dna_config = JSON.parse(rawdata);  
		return dna_config;		
    }
	console.log("File not present with name : " + fileName);
	return undefined;
}

function hasValue(data) {
	if(data !== undefined){
		return true
	}
	return false;
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

/**********************************************************************************/
function sendMessageIfDifference(data,file){
	
	var lhsString 	= readJsonFile(file);
	var rhsString	= JSON.stringify(data);
	
				//console.log('is Array');

	/*if(fileData != undefined && rhsString != undefined){
		var lhsString 	= JSON.stringify(fileData);
		var lhsJSON		= JSON.parse(lhsString);
		var rhsJSON  	= JSON.parse(jsonContent);
	
		if(response instanceof Array){
			console.log('is Array');
		}else{
			console.log('is JSON');
		}
	}*/
}

/**************************Starting https node server******************************/
function testDiff(){
	var diffs = [];
	
	var initialJson = {
		'tag' : 125,
		'tagName' : 'sad323',
		'protocol' : 'HTTPS',
		'version'  : '1.0'
	};
	console.log('Initial Json : ' + JSON.stringify(initialJson));

	var j1 = {
		'tag' : 125,
		'tagName' : 'sad323',
		'version' : '1.1'
	};
	var j2 = {
		'tag' : 125,
		'tagName' : 'sad323',
		'protocol' : 'HTTPS',
		'version' : '1.0'
	};
	var j3 = {
		'tag' : 125,
		'tagName' : 'sad323',
		'protocol' : 'VOIP',
		'version' : '1.2',
		'iOX_version' : '1.7.0'
	};
	var array = [j1,j2,j3];
	
	array.forEach(function(json){
		console.log('*******************************************');
		var node = {};
		var modified = false;
		diff.recursiveDiff(initialJson,json,node,modified);
		diffs.push(JSON.stringify(node));
		console.log('All Diffs : ' + JSON.stringify(node) +'| Modified : ' + modified);
		if(modified == true){
			sendSparkMessage(SPARK_ROOM_ID,JSON.stringify(node));
		}
		console.log('*******************************************\n');
	});	
}

var port = process.env.PORT || 8380;
var server = https.createServer( options, app );
server.listen( port, function () {
    console.log( 'Express server listening on port ' + server.address().port );
} );