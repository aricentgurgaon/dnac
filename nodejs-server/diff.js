'use strict';

var arrayDifference = require("array-difference");

module.exports = {
    recursiveDiff: function (a, b, node, modified) {
		var checked = [];
		
		console.log('lhs :'+ JSON.stringify(a));
		console.log('rhs :'+ JSON.stringify(b));
		
		var lhsString = JSON.stringify(a);
		var rhsString = JSON.stringify(b);

		var lhs  	= JSON.parse(lhsString);
	   	var rhs  	= JSON.parse(rhsString);
		
		var keysLhs = Object.keys(a);
		var keysRhs = Object.keys(b);
				
		keysLhs.forEach(function(prop){
			var p1 = lhs[prop];
			var p2 = rhs[prop];
			
			if(typeof p2 === 'undefined'){
				node[prop] = {'-' : p1};
				modified = true;
			}
			else if(JSON.stringify(a[prop]) != JSON.stringify(p2)){

				if(typeof p2 != 'object' || p2 == null){
					node[prop] = {'-':p1, '+':p2};
					modified = true;
				}
				else {
					// if array
					if(Object.prototype.toString.call(p2) === '[object Array]'){
						console.log('Equal to : Array');
						node[prop] = [];
						recursiveDiff(p1, p2, node);
					}
					// if object
					else {
						console.log('Equal to : {}');
						node[prop] = {};
						recursiveDiff(p1, p2, node);
					}
				}
			}else{
				node[prop] = p1;
			}			
		});
		if(keysRhs.length > keysLhs.length){
			var diffKeys = arrayDifference(keysLhs, keysRhs);
			console.log('diffKeys : '+diffKeys);
			if(diffKeys.length > 0){
				diffKeys.forEach(function(key){
					node[key] = {'+' : rhs[key]}
				});
			}
		}
		console.log('modified :'+ modified);

	}
};