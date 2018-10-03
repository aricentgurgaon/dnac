'use strict';
var querystring = require('querystring');
var https = require('https');
module.exports = {
    performRequest: function (request) {
        var dataString = querystring.stringify(request.data);
        var headers = {};
        if (request.headers) {
            headers = request.headers;
        }

        var endpoint = request.endpoint;
        if (request.method === 'GET') {
            //endpoint += '?' + querystring.stringify(request.data);
        } else if (!request.headers) {
            headers = {
                'Content-Type': 'application/json; charset=UTF-8',
                'Content-Length': dataString.length
            };
        }

        var options = {
            host: request.host,
            path: endpoint,
            method: request.method,
			ecdhCurve: 'auto',//'secp384r1' 'auto' also works
            headers: headers
        };
        if (request.port) {
            options['port'] = request.port;
        }

        var req = https.request(options, function (res) {
            res.setEncoding('utf-8');
            var setcookie = res.headers["set-cookie"];
            var responseString = '';
							
            res.on('data', function (data) {
                responseString += data;
            });
            res.on('end', function () {
                var returnVal = {
                    response: responseString,
                    cookie: setcookie
                };
				//console.log('responseString: ' + responseString);
                request.success(returnVal);
            });
        });
        req.on('error', function (error) {
            console.log("Error : " + error.message);
        });
        if (headers['Content-Type'] &&
                headers['Content-Type'].startsWith('application/json')) {
            dataString = JSON.stringify(request.data);
        }
        //console.log('datastring: ' + dataString);
        req.write(dataString);
        req.end();
    },
    getCookieFromSessionData: function (session, host) {
        var cookie = '';
        if (session.cookie) {
            session.cookie.forEach(
                    function (entry) {
						console.log("3");
                        var tokens = entry.split(';');
                        tokens.forEach(
                                function (token) {
                                    var property = token.split('=');
                                    if ('Domain' === property[0].trim() &&
                                            host.indexOf(property[1].trim()) > -1) {
                                        cookie += tokens[0] + '; ';
                                    }
                                }
                        );
                    }
            );
        }
        console.log("COOKIE:" + cookie);
        return cookie;
    }
};