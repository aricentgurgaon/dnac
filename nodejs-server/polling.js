'use strict';
var httpUtility = require('./http_utility');
const Poller = require('./Poller');

var pollers = {};

module.exports = {

    startPolling: function (host,api_id,eventId,token,callback) {
        // Set 1s timeout between polls
        // note: this is previous request + processing time + timeout
        if(eventId === undefined){
            eventId = api_id;
        }
        if(pollers[eventId] != undefined){
            callback({'status':'Polling polling already in progress on for Id : '+eventId},false);
            return;
        }

        let poller = new Poller(10000,eventId); 
        // Wait till the timeout sent our event to the EventEmitter
        poller.onPoll(() => {
            console.log('\nPolling for event id : ' + eventId);
            var api = undefined;
            switch (api_id) {
                case 'DEVICE_BY_ID':
                    api = '/api/v1/network-device/'+eventId;
                    break;
                case 'DEVICES':
                    api = '/api/v1/network-device/?limit=10&offset=1&sortBy=managementIpAddress&order=asc';
                    break;
                case 'INTERFACES':
                    api = '/api/v1/interface';
                    break;
                case 'TOPOLOGY':
                    api = '/api/v1/topology/physical-topology';
                    break; 
                default:
                    sendResponse(res,405,{'status': 'HTTP method not supported'});
                    break;
            }

            var headers = {
                'Content-Type': 'application/json; charset=utf-8',
                'x-auth-token': token
            };
    
            var errorCallback = function (data) {
                callback({'status': 'Error in getting getQuery API response : '+data},false,true);
                poller.poll(); // Go for the next poll
            };

            var successCallback = function (data) {
                try {
                    var response = JSON.parse(data.response);
                    callback(response,true,false);
                } catch (e) {
                    console.log('\nError in successCallback : ' + e.errmsg);
                }
                poller.poll(); // Go for the next poll
            }
    
            var request = {
                host: host,
                endpoint: api,
                headers: headers,
                method: 'GET',
                data: null,
                success: successCallback,
                error: errorCallback
            };
            httpUtility.performRequest(request);
        });
        // Initial start
        poller.poll();
        pollers[eventId] = poller;
        callback({'status':'Polling started for event Id : '+eventId},true,true);
    },
    stopPolling: function (eventId,callback) {
        var poller = pollers[eventId];
        poller.stop(); 
        callback({'status':'polling stopped for event Id : '+eventId},true);
    }
}