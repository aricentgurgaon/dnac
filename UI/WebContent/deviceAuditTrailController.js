var app = angular.module('myApp')
app.controller('DeviceAuditTrailController', function($scope, $rootScope, $stateParams, $state, $http,$location, $cookies) {
	$scope.username = $cookies.username;
	$scope.deviceList = [];
	$scope.hostList =[];
	$scope.deviceId = '';
	$scope.hostId ='';
	$scope.auditSummary =[];
	$scope.isDisabled = true;
	console.log("username---- "+ $scope.username);
	  if(!$scope.username){
		  $location.path('/login/');
	  }
	//$scope.user = $rootScope.userName;
	  
	//API to get all DNA host configured..
		 $http({
		        url: 'https://localhost:8380/eam/v1/dna/config',
		        method: "GET",
		        headers: {'Content-Type': 'application/json'}
		    })
		    .then(function(response) {
				console.log(response);
				for (var i=0;i<response.data.length;i++){
					$scope.hostList.push(response.data[i]._id);
				}
				console.log($scope.hostList);
		        }, 
		        function(error) {
		            // failed
		        	console.log(error);
					console.log("failed to get");
		        });
		 
		 $scope.onHostChange = function(){
			 console.log("host changed===  "+$scope.hostId);
			 $http({
				 url: 'https://localhost:8380/eam/v1/dna/'+$scope.hostId+'/devices',
				 method: "GET",
				 headers: {'Content-Type': 'application/json'}
			 })
			 .then(function(response) {
				 console.log(response);
				 if(response.data.length>0){
					 $scope.isDisabled = false;
				 }
				 for (var i=0;i<response.data.length;i++){
					 $scope.deviceList.push(response.data[i]);
				 }
				 console.log($scope.deviceList);
			 }, 
			 function(error) { // optional
				 // failed
				 $scope.isDisabled = true;
				 console.log(error);
				 console.log("failed to get device");
			 });
		 }
	  
		 
	  $scope.run = function(){
		  if($scope.hostId !='' && $scope.deviceId !='' && $scope.hostId != undefined && $scope.deviceId != undefined )
		  {
		  $http({
		       //url :'https://localhost:8380/eam/v1/dna/'+$scope.hostId+'/device/'+$scope.deviceId,
				url : 'https://localhost:8380/eam/v1/dna/'+$scope.hostId+'/audit?deviceId='+$scope.deviceId,
		        method: "GET",
		        headers: {'Content-Type': 'application/json'}
		    })
		    .then(function(response) {
		            // success
		    	console.log("success");
				console.log(response);
				//$scope.auditSummary.push(response.data);
				for (var i=0;i<response.data.length;i++){
					$scope.auditSummary.push(response.data[i]);
				}
				console.log("audit summary============================");
				console.log($scope.auditSummary);
		        }, 
		        function(response) { // optional
		            // failed
		        	console.log(response);
					console.log("failed to post");
		        });
		  }
		  else {
			  alert("Either host id or  device name is not selected");
			  return;
		  }
			  
	  }

	console.log("inside device audit trail controller ");
});
