'use strict';

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';
 
// Database Name
const dbName = 'dnaDB';

module.exports = {
    insertDocument: function (collectionName, objectToInsert,callback) {
        
		MongoClient.connect(url,{ useNewUrlParser: true }, function(err, client) {
			if (err){
				callback(err,false);
				return;
			} 

			var dbo = client.db(dbName);
			
			dbo.collection(collectionName).insertOne(objectToInsert, function(err, result) {
				if (err){
					//If error in connecting to mongo instance send error in callback
					callback(err,false);
				}else{
					console.log("Document inserted");
					callback(result,true);					
				}
				client.close();
			});
		});
	},
	getAllDocuments: function (collectionName, callback) {
		MongoClient.connect(url,{ useNewUrlParser: true }, function(err, client) {
			if (err){
				//If error in connecting to mongo instance send error in callback
				console.log('Conection cannot be established with MongoDB');
				callback(err,false);
				return;
			}

			var dbo = client.db(dbName);
			dbo.collection(collectionName).find({}).toArray(function(err, result) {
				if (err){
					callback(err,false);
				}
				else{
					callback(result,true);
				}
				client.close();
			  });
		}); 
    },
    getDocumentById: function (collectionName, value, callback) {
	
		MongoClient.connect(url,{ useNewUrlParser: true }, function(err, client) {
			if (err){
				//If error in connecting to mongo instance send error in callback
				console.log('Conection cannot be established with MongoDB');
				callback(err,false);
				return;
			}

			var dbo = client.db(dbName);
			var query = { _id : value };
			dbo.collection(collectionName).find(query).toArray(function(err, result) {
				if (err){
					callback(err,false);
				}
				else{
					console.log("Get  Result : " + result);
					callback(result[0],true);
				}
				client.close();
			});
		}); 
    },
	deleteDocumentById: function (collectionName, value, callback) {
		
		MongoClient.connect(url,{ useNewUrlParser: true }, function(err, client) {
			if (err){
				//If error in connecting to mongo instance send error in callback
				callback(err,false);
				return;
			}
			if(client == null || client == undefined){
				callback({'status' : 'Conection cannot be established with MongoDB'},false);
			}

			var dbo = client.db(dbName);
			var query = { _id : value };
			
			 dbo.collection(collectionName).deleteOne(query, function(err, obj) {
				if (err){
					callback(err,false);
				}
				else{
					console.log("Delete  Result : " + result);
					callback({'status' : 'Document deleted successfully'},true);
				}
				client.close();
			});
		}); 
    },
	updateDocumentById: function (collectionName, value, object, callback) {
		
		MongoClient.connect(url,{useNewUrlParser: true}, function(err, client) {
			if (err){
				callback(err,false);
				return;
			}
			var dbo = client.db(dbName);
			var query = { _id : value };
			
			dbo.collection(collectionName).updateOne(query, {$set:object}, function(err, result) {
				if (err){
					console.log("Update Error : " + err);
					callback(err,false);
				}
				else{
					console.log("Update  Result : " + result);
					callback({'status' : 'Document updated successfully'},true);
				}
				client.close();
			});
		}); 
	},upsertDocumentById: function (collectionName, value, object, callback) {
		
		MongoClient.connect(url,{useNewUrlParser: true}, function(err, client) {
			if (err){
				callback(err,false);
				return;
			}
			var dbo = client.db(dbName);
			var query = { _id : value };
			
			dbo.collection(collectionName).updateOne(query, {$set:object}, { upsert: true }, function(err, result) {
				if (err){
					console.log("Update Error : " + err);
					callback(err,false);
				}
				else{
					console.log("Update  Result : " + result);
					callback({'status' : 'Document updated successfully'},true);
				}
				client.close();
			});
		}); 
	},
};