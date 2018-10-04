//configController.js
var app = angular.module('myApp')
app.controller('ConfigController', function($scope, $rootScope, $stateParams, $state, $http,$cookies, $location) {
	$scope.username = $cookies.username;
	console.log("username---- "+ $scope.username);
	  if(!$scope.username){
		  $location.path('/login/');
	  }
$scope.user = $rootScope.userName;
$scope.userName = '';
$scope.host = '';
$scope.password = '';
$scope.buserName = '';
$scope.bhost = '';
$scope.bpassword = '';
$scope.id ='';
$scope.spark ='';
$scope.sparkList = [{'sparkId':'123','sparkName':'DNA_POC'},{'sparkId':'456','sparkName':'common Room'},{'sparkId':'789','sparkName':'Any_Name'}];

var generateId = function () {
	  var text = "";
	  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	  for (var i = 0; i < 8; i++)
	    text += possible.charAt(Math.floor(Math.random() * possible.length));

	  return text;
	}

$scope.save = function(){
	$scope.id= generateId();
	var data = {
			dna:{
				host : $scope.host,
				username : $scope.userName,
				password : $scope.password
				},
			blockChain:{
				host : $scope.bhost,
				username : $scope.buserName,
				password : $scope.bpassword
				},
			spark:{
				sparkId : $scope.spark
				}
			}
			
	console.log(data);
	    $http({
	    	url: 'https://localhost:8380/eam/v1/dna/'+$scope.id+'/config',
	        method: "POST",
	        data: data,
	        headers: {'Content-Type': 'application/json'}
	    })
	    .then(function(response) {
	            // success
	    	console.log("success");
			console.log(response);
			alert("configuration saved successfully.");
			$scope.reset();
			$state.transitionTo('config');
	        }, 
	        function(response) { // optional
	            // failed
	        	console.log(response);
				console.log("failed to post");
				alert("Error while saving configuration.");
				$scope.reset();
				$state.transitionTo('config');
	        }
	    );
	}

$scope.reset = function(){
	console.log("reset called");
	$scope.userName = '';
	$scope.host = '';
	$scope.password = '';
	$scope.buserName = '';
	$scope.bhost = '';
	$scope.bpassword = '';
	$scope.id = '';
	$scope.spark ='';
}
});