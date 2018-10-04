//loginService.js
var app = angular.module('myApp');
app.factory('LoginService', function() {
var admin = 'admin';
var pass = 'cisco123';
var isAuthenticated = false;
return {
login : function(username, password) {
	console.log("validating user  "+username);
isAuthenticated = username === admin && password === pass;
return isAuthenticated;
},
isAuthenticated : function() {
return isAuthenticated;
}
};
});