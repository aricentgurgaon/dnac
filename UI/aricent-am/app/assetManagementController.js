var app = angular.module('myApp')
app.controller('AssetMgmtController', function($scope, $rootScope, $stateParams, $state, $http,$location, $cookies) {
	$scope.username = $cookies.username;
	console.log("username---- "+ $scope.username);
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
		console.log("search called for "+$scope.serialNo);
		 $http({
			 url: 'https://localhost:8380/eam/v1/dna/asset?assetId='+$scope.serialNo,
			 method: "GET",
			 headers: {'Content-Type': 'application/json'}
		 })
		 .then(function(response) {
			 console.log(response);
			 	$scope.serialNo = response.data._id;
				$scope.deviceName = response.data.deviceName;
				$scope.deviceType = response.data.deviceType;
				$scope.state = response.data.state;
				$scope.info =  response.data.info;
		 }, 
		 function(error) { // optional
			 // failed
			 console.log(error);
			 console.log("failed to get the Asset");
		 });
	} 

	$scope.save = function(){
		var assetData = {
				deviceType : $scope.deviceType,
				deviceName : $scope.deviceName,
				state : $scope.state,
				info : $scope.info
		}

		console.log("data -- ");
		console.log(assetData);
		
		$http({
	       url :'https://localhost:8380/eam/v1/dna/asset?assetId='+$scope.serialNo,
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
	        function(response) { // optional
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
