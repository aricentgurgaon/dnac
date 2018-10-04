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
var Utility 	= require('./utility');
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
var complianceTemplate 		= undefined;
const config_Collection		= 'config';
const template_Collection 	= 'template';
const assets_Collection 	= 'assets';

const SPARK_ROOM_ID = 'Y2lzY29zcGFyazovL3VzL1JPT00vNmY5ODRjNTAtYmIwNi0xMWU4LTlmNzgtY2ZkNmJiM2UzZWQ5';
/*********************************API Endpoints*************************************************/
    /*CRUD API for DNA Config's*/

/**
 * GET Api to start schedular
 */	
app.get('/eam/v1/dna/:dnaId/poll', function (req, res) {
	var option	 = req.query.option;
	var assetId = req.query.id;
	var dnaId 	 = req.params.dnaId;

	if(dnaConfig === undefined || dnaId != dnaConfig['_id']){
		console.log('Config not present, fetching from Mongo DB for dna Id : '+dnaId);
		fetchConfig(dnaId,config_Collection,function(result,status){

			if(result != null && result != undefined){
				if(status == true){
					dnaConfig = result['dna'];
					blockchainConfig = result['blockchain'];
					fetchToken(function (token,status,error){
						if(status == true){
							triggerPolling(res,dnaConfig.host,option,assetId,token,true);
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
				triggerPolling(res,dnaConfig.host,option,assetId,token,true);
			}
		});
	}
});

/**
 * GET Api to start complianace schedular
 */	
app.get('/eam/v1/dna/:dnaId/template/:template/compliance', function (req, res) {
	var dnaId 	   = req.params.dnaId;
	var templateId = req.params.template;
	var polling    = req.query.polling;
	var option	   = req.query.option;
	var assetId	   = req.query.assetId;

	if(dnaConfig === undefined || dnaId != dnaConfig['_id']){
		console.log('Config not present, fetching from Mongo DB for dna Id : '+dnaId);

		fetchConfig(templateId,template_Collection,function(result,status){
			if(result != null && result != undefined){
				complianceTemplate = result;
				fetchConfig(dnaId,config_Collection,function(result,status){
					if(result != null && result != undefined){
						if(status == true){
							dnaConfig = result['dna'];
							blockchainConfig = result['blockchain'];
							fetchToken(function (token,status,error){
								console.log('Token Found -> compliance');
								if(status == true){
									console.log("Start polling");
									triggerPolling(res,dnaConfig.host,option,assetId,token,polling);
								}else{
									sendResponse(res,500,{'status':error.errmsg});	
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
				sendResponse(res,500,{'status':'No compliance template found for template id : '+dnaId});	
			}
		});
	}else{
		fetchConfig(dnaId,template_Collection,function(result,status){
			if(result != null && result != undefined){
				fetchToken(function (token,status,error){
					if(status == true){
						triggerPolling(res,dnaConfig.host,option,assetId,token);
					}else{
						sendResponse(res,500,result);	
					}
				});
			}else{
				sendResponse(res,500,{'status':'No compliance template found for template id : '+dnaId});	
			}
		});
	}
});

app.get('/eam/v1/dna/:dnaId/audit', function (req, res) {
	var assetId = req.query.assetId;
	var dnaId    = req.params.dnaId;

	if(dnaConfig === undefined || dnaId != dnaConfig['_id']){
		console.log('Config not present, fetching from Mongo DB for dna Id : '+dnaId);
		fetchConfig(dnaId,config_Collection,function(result,status){
			if(result != null && result != undefined){
				if(status == true){
					dnaConfig = result['dna'];
					blockchainConfig = result['blockchain'];
					getAuditTrail(assetId,res);
				}else{
					sendResponse(res,500,result);	
				}
			}else{
				sendResponse(res,500,{'status':'No config found for dna id : '+dnaId});	
			}
		});
	}else{
		getAuditTrail(assetId,res);
	}
});


/**
 * GET API to stop any polling going on with the help of specified eventId
 */
app.get('/eam/v1/dna/:dnaId/event/:eventid/stopPolling', function (req, res) {
	var assetId = req.params.eventid;
	poller.stopPolling(assetId,function(result,status){
		sendResponse(res,200,result);	
	});
});

/**
 * CRUD Api's to perform management of assets in database
 */
app.all('/eam/v1/dna/:dnaId/asset', function (req, res) {
	var assetId = req.query.assetId;
	var dnaId   = req.params.dnaId;
	switch (req.method) {
	case 'GET':
		if(assetId != undefined){
			getConfig(res,assetId,assets_Collection);
		}else{
			getAllConfig(res,assets_Collection);
		}
        break;
    case 'POST':
		addAsset(req,res,assetId,assets_Collection,dnaId);
        break;
	case 'PUT':
		addAsset(req,res,assetId,assets_Collection,dnaId);
        break;
	case 'DELETE':
        deleteConfig(res,assetId,assets_Collection);
        break;
    default:
		sendResponse(405,{'status': 'HTTP method not supported'});
	} 
});

/**
 * API to perform CRUD operation for compliance templates
 */
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

/**
 * API to perform CRUD operations on configs stored in database
 */
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

/**
 * API to get all DNA configs stored in database
 */
app.get('/eam/v1/dna/config',function (req, res){
	getAllConfig(res,config_Collection);
});

/**
 * API to get topology to specified DNA network
 */
app.get('/eam/v1/dna/:dnaId/topology', function (req, res) {
	authorizeAndCallApi(res,req.params.dnaId, null,'TOPOLOGY');
});

/**
 * API to get all interfaces availabe in DNA network
 */
app.get('/eam/v1/dna/:dnaId/interfaces', function (req, res) {
	authorizeAndCallApi(res,req.params.dnaId, null,'INTERFACES');
});

/**
 * API to get all assets/devices in DNA network
 */
app.get('/eam/v1/dna/:dnaId/devices', function (req, res) {
	authorizeAndCallApi(res,req.params.dnaId, null,'DEVICES');
});

/**
 * API to perform CRUF operation on any asset
 */
app.all('/eam/v1/dna/:dnaId/device/:assetId', function (req, res) {
	
	var dnaId	 = req.params.dnaId;
	var assetId = req.params.assetId;
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
	authorizeAndCallApi(res,dnaId, assetId,endPoint);
});

/**
 * 
 * @param {*} res 
 * @param {*} host 
 * @param {*} option 
 * @param {*} assetId 
 * @param {*} token 
 */
var triggerPolling = function (res,host,option,assetId,token,polling){

	if(polling != undefined && polling == true){
		console.log("Trigerring polling for topology for every 10000 seconds");
		poller.startPolling(host,option,assetId,token,function(result,status,returnResponse){
			if(returnResponse){
				sendResponse(res,200,result);
			}else{
				var arrNodes = [];
				checkCompliance(result,function(assetblock,topologyNode,compliant){
					arrNodes.push(topologyNode);
					if(arrNodes.length == topology['nodes'].length){
						topology['nodes'] = arrNodes;
					}
					if(compliant == false){
						publishToBlockChain(assetblock);
					}
				});
			}		
		});
	}else{
		var api = '/api/v1/topology/physical-topology';
		var headers = {
			'Content-Type': 'application/json; charset=utf-8',
			'x-auth-token': token
		};
		httpCall(dnaConfig.host, api,null,'GET',null,headers, function (result,status){;
			if(status == true){
				var arrNodes = [];
				checkCompliance(result,function(assetblock,topologyNode,compliant){
					arrNodes.push(topologyNode);
					if(arrNodes.length == result['nodes'].length){
						result['nodes'] = arrNodes;
						sendResponse(res,200,result);
					}
					if(compliant == false){
						publishToBlockChain(assetblock);
					}
				});
			}else{
				console.log('Error in fetching topology');
				sendResponse(res,500,result);
			}
		});
	}
}

/**
 * 
 * @param {*} topology 
 */
var checkCompliance = function(topology,callback){

	var nodes = topology['nodes'];
	nodes.forEach(function(node){
		var id  = node['id'];
		var api = '/api/v1/network-device/'+id;
		var headers = {
			'Content-Type': 'application/json; charset=utf-8',
			'x-auth-token': token
		};
		httpCall(dnaConfig.host, api,null,'GET',null,headers, function (result,status){
			var compliant = false;
			if(status == true){
				var criteriaValue  = complianceTemplate['criteriaValue'];
				var valueToCompare = result[complianceTemplate['criteria']];
				
				console.log('criteria :' +complianceTemplate['criteria'] + 
				' criteriaValue : '+criteriaValue+ ' valueToCompare :'+valueToCompare);

				if(valueToCompare != undefined && valueToCompare < criteriaValue){
					console.log('Device with id : '+id+ ' not compliant\n');
					node['compliant'] = false;
				}else{
					node['compliant'] = true;
					compliant = true;
					console.log('Device with id : '+id+ ' is compliant\n');
				}
			}else{
					
				console.log('No asset found in DNA-C network with Id : : '+id);
			}	
			callback(result,node,compliant);
		});
	});
}

/**
 * Function to get audit trail for the specified asset id
 * @param {*} assetId 
 * @param {*} res 
 */
var getAuditTrail = function (assetId, res) {

	var host 	= blockchainConfig.host;
	var api  	= '/traverse/'+assetId;
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

/**
 * Function to publish block to blockchain network
 * @param {*} block 
 */
var publishToBlockChain = function (block) {

	console.log('Block to be posted : '+ JSON.stringify(block));
	var host 	= blockchainConfig.host;
	var api  	= '/update';
	var method 	= 'POST';
	var port 	= 5000;
    var headers = {
        'Content-Type': 'application/json; charset=utf-8'
    };
	
	httpCall(host, api, port, method, block ,headers, function (result,status){;
		if(status == true){
			//sendSparkMessage(SPARK_ROOM_ID, JSON.stringify(result));
			console.log('Publish to blockchain response : : '+JSON.stringify(result));
		}else{
			console.log('Publish to blockchain failed : : '+result);
		}
	});
}

/**
 * Function to send message to specified spark room
 * @param {*} roomId 
 * @param {*} message 
 */
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

/**
 * 
 * @param {*} host 
 * @param {*} api 
 * @param {*} port 
 * @param {*} method 
 * @param {*} data 
 * @param {*} headers 
 * @param {*} callback 
 */
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

/**
 * 
 * @param {*} res 
 * @param {*} dnaId 
 * @param {*} collection 
 */
var deleteConfig = function (res,dnaId,collection){	
	mongo.insertDocument(collection,jsonObj,function(result,success){
		if(success == true){
			sendResponse(res,200,'Config deleted successfully');
		}else{
			sendResponse(res,500,{ 'status': result.errmsg});	
		}
	});
}

/**
 * 
 * @param {*} res 
 * @param {*} collection 
 */
var getAllConfig = function (res,collection){
	mongo.getAllDocuments(collection,function(result,success){	
		if(success == true){
			sendResponse(res,200,result);
		}else{
			if(Utility.IsJsonString(result)){
				sendResponse(res,500,result);	
			}else{
				sendResponse(res,500,{ 'status': result.errmsg});	
			}
		}	
	});
}

/**
 * 
 * @param {*} res 
 * @param {*} id 
 * @param {*} collection 
 */
var getConfig = function (res,id,collection){

	mongo.getDocumentById(collection,id,function(result,success){	
		if(success == true){
			sendResponse(res,200,result);
		}else{
			if(Utility.IsJsonString(result)){
				sendResponse(res,500,result);	
			}else{
				sendResponse(res,500,{ 'status': result.errmsg});	
			}
		}	
	});
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} id 
 * @param {*} collection 
 */
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

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} id 
 * @param {*} collection 
 * @param {*} dnaId 
 */
var addAsset = function (req,res,id,collection,dnaId){
	if(req.body != undefined){
		var jsonObj = req.body;
		var status  = false;
		jsonObj['_id'] = id;
		jsonObj['serialNumber'] = id;
		mongo.upsertDocumentById(collection,id,jsonObj,function(result,success){
			if(success == true){
				sendResponse(res,200,result);

				fetchConfig(dnaId,config_Collection,function(result,status){
					if(result != null && result != undefined){
						if(status == true){
							console.log('Config found for id : '+dnaId);

							dnaConfig = result['dna'];
							blockchainConfig = result['blockchain'];
							publishToBlockChain(jsonObj);
						}else{
							sendResponse(res,500,result);	
							console.log(result);
						}
					}else{
						console.log('No config found for dna id : '+dnaId);
					}
				});
			}else{
				console.log({ 'status': result.errmsg});
			}
		});
	}else{
		sendResponse(res,400,{ 'status': 'Bad Request, request body no found'});	
	}
}

/**
 * 
 * @param {*} res 
 * @param {*} dnaId 
 * @param {*} assetId 
 * @param {*} api_Id 
 */
function authorizeAndCallApi(res,dnaId, assetId, api_Id){
	//If no cached config present then fetch config from MongoDB//
	if(dnaConfig === undefined || dnaId != dnaConfig['_id']){
		console.log('Config not present, fetching from Mongo DB for dna Id : '+dnaId);
		fetchConfig(dnaId,config_Collection,function(result,status){
			if(result != null && result != undefined){
				if(status == true){
					console.log('Config found for id : '+dnaId);
					
					dnaConfig = result['dna'];
					blockchainConfig = result['blockchain'];
					fetchToken(function (token,status,error){
						if(status == true){
							callAPI(dnaConfig.host, api_Id, dnaId, assetId, res);
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
				callAPI(dnaConfig.host, api_Id, dnaId, assetId, res);
			}
		});
	}
}

/**
 * Fetch config data if not present
 * @param {*} dnaId 
 * @param {*} callback 
 */
function fetchConfig(dnaId,collectionName,callback){
	console.log('\nFetching config for DNA ID : '+dnaId);
	mongo.getDocumentById(collectionName,dnaId,function(result,success){	
		if(success == true){
			callback(result,true);
		}else{
			callback({ 'status': 'Cannot fetch token as no config present for dna id : '+dnaId},false);	
		}	
	});
}

/**
 * Function to fetch DNA token if not present
 * @param {*} callback 
 */
function fetchToken(callback){
        
	//If token is cached then call api//
	let host = dnaConfig.host;

	if (Utility.hasValue(token) === true){
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
			if(Utility.hasValue(token) === false){
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

/**
 * util function to make HTTP calls 
 * @param {*} host 
 * @param {*} port 
 * @param {*} api 
 * @param {*} headers 
 * @param {*} method 
 * @param {*} data 
 * @param {*} successCallback 
 * @param {*} errorCallback 
 */
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

/**
 * utility function to call api's 
 * @param {*} host 
 * @param {*} api_id 
 * @param {*} dnaId 
 * @param {*} assetId 
 * @param {*} res 
 */
function callAPI(host, api_id, dnaId, assetId, res){
	
	var api = undefined;

	switch (api_id) {
    case 'DEVICE_BY_ID':
		api = '/api/v1/network-device/'+assetId;
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

/**
 * Function to beautify and build http response with response code
 * @param {*} res 
 * @param {*} statusCode 
 * @param {*} data 
 */
function sendResponse(res, statusCode, data){	
	var beautifyOptions = {
                    indent_size: 2,
                    indent_char: " "
                };
	var jsonContent = JSON.stringify(data);
    console.log('Response : ' + beautify(jsonContent, beautifyOptions));
	res.status(statusCode).json(data);
}


var port = process.env.PORT || 8380;
var server = https.createServer( options, app );
server.listen( port, function () {
    console.log( 'Express server listening on port ' + server.address().port );
} );