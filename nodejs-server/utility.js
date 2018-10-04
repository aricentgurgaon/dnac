'use strict';

var beautify = require('js-beautify').js_beautify;
var querystring = require('querystring');

module.exports = {
    writeDataToFile: function (data,file) {
        var success = true;
	    fs.writeFile(file, data, 'utf8', function (err) {
		    if (err) {
		    	success = false;
		    }
	    });
	    return success
    },
    logJsonResponse: function (message, data) {
        var beautifyOptions = {
            indent_size: 2,
            indent_char: " "
        };
        console.log(message +'\n'+ beautify(data, beautifyOptions));
    },
    readJsonFile: function (fileName) {
        if (fs.existsSync(fileName)) {
            let rawdata = fs.readFileSync(fileName);  
            let dna_config = JSON.parse(rawdata);  
            return dna_config;		
        }
        console.log("File not present with name : " + fileName);
        return undefined;
    },
    hasValue: function (data) {
        if(data !== undefined){
            return true
        }
        return false;
    },
    IsJsonString: function (data) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    },
};