var app = angular.module('myApp')
app.controller('AssetMgmtController', function($scope, $rootScope, $stateParams, $state, $http,$location, $cookies, cfg) {
	$scope.username = $cookies.username;
	  if(!$scope.username){
		  $location.path('/login/');
	  }
	//$scope.user = $rootScope.userName;
	$scope.serialNo = '';
	$scope.deviceName = '';
	$scope.deviceType ='';
	$scope.state ='';
	$scope.info = '';
	$scope.stateList = ['Purchase','Assign to engg.','Attach to DNA','Discovered'];
	
	$scope.search = function(){
		if($scope.serialNo == '' || $scope.serialNo == undefined){
			alert("Please Enter Asset Key to search");
			return;
		}
		 $http({
			 url: 'https://' + cfg.API_SERVER_HOST + ':' + cfg.API_SERVER_PORT + '/eam/v1/dna/asset?assetId='+$scope.serialNo,
			 method: "GET",
			 headers: {'Content-Type': 'application/json'}
		 })
		 .then(function(response) {
			 console.log(response);
			 console.log(response.data);
			 console.log(response.data.length);
			 if(response.data != '' && response.data != undefined){
			 	$scope.serialNo = response.data._id;
				$scope.deviceName = response.data.deviceName;
				$scope.deviceType = response.data.deviceType;
				$scope.state = response.data.state;
				$scope.info =  response.data.info;
			 }
			 else{
				 alert("No Asset found for Asset Key "+$scope.serialNo);
			 }
		 }, 
		 function(error) {
			 // failed
			 console.log(error);
			 alert("No Asset found for Asset Key "+$scope.serialNo);
			 console.log("failed to get the Asset");
		 });
	} 

	$scope.save = function(){
		if($scope.serialNo == '' || $scope.serialNo == undefined){
			alert("Please Enter Asset Key.");
			return;
		}
		if($scope.deviceType == '' || $scope.deviceType == undefined){
			alert("Please Enter Asset Type.");
			return;
		}
		if($scope.deviceName == '' || $scope.deviceName == undefined){
			alert("Please Enter Asset Name.");
			return;
		}
		if($scope.state == '' || $scope.state == undefined){
			alert("Please Enter State.");
			return;
		}
		var assetData = {
				deviceType : $scope.deviceType,
				deviceName : $scope.deviceName,
				state : $scope.state,
				info : $scope.info
		}
		$http({
	       url :'https://' + cfg.API_SERVER_HOST + ':' + cfg.API_SERVER_PORT + '/eam/v1/dna/asset?assetId='+$scope.serialNo,
	        method: "POST",
	        data: assetData,
	        headers: {'Content-Type': 'application/json'}
	    })
	    .then(function(response) {
	            // success
	    	console.log("success");
			console.log(response);
			alert("Asset Saved successfully.");
			$scope.reset();
			$state.transitionTo('assetmgmt');
	        }, 
	        function(response) {
	            // failed
	        	console.log(response);
				console.log("failed to post");
				alert("Error While saving Asset.");
				$scope.reset();
				$state.transitionTo('assetmgmt');
	        }
	    );
	}

	$scope.reset = function(){
		$scope.serialNo = '';
		$scope.deviceName = '';
		$scope.deviceType ='';
		$scope.state = '';
		$scope.info = '';
	}
	console.log("inside Asset management controller");
});
