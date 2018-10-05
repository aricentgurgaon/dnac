var app = angular.module('myApp')
app.controller('AssetMgmtController', function($scope, $rootScope, $stateParams, $state, $http,$location, $cookies, $filter, cfg) {
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
	$scope.hostId ='';
	$scope.stateList = ['Purchased','Assigned To Engineer Team','Attached To DNA','Decommissioned','Moved To Store','Disposed'];
	
	 $http({
         url: 'https://' + cfg.API_SERVER_HOST + ':' + cfg.API_SERVER_PORT + '/eam/v1/dna/config',
         method: "GET",
         headers: {'Content-Type': 'application/json'}
     })
     .then(function(response) {
         $scope.hostId = response.data[0]._id;
         }, 
         function(error) {
             // failed
             console.log(error);
             console.log("failed to get");
         });
	
	$scope.search = function(){
		if($scope.serialNo == '' || $scope.serialNo == undefined){
			alert("Please Enter Asset Key to search");
			return;
		}
		 $http({
			 url: 'https://' + cfg.API_SERVER_HOST + ':' + cfg.API_SERVER_PORT + '/eam/v1/dna/'+$scope.hostId+'/asset?assetId='+$scope.serialNo,
			 method: "GET",
			 headers: {'Content-Type': 'application/json'}
		 })
		 .then(function(response) {
			 if(response.data != '' && response.data != undefined){
			 	$scope.serialNo = response.data._id;
				$scope.deviceName = response.data.hostname;
				$scope.deviceType = response.data.type;
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
		
		var date = Date.now();
		var formatedDate = $filter('date')(date, 'yyyy-MM-dd HH:mm:ss');
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
				type : $scope.deviceType,
				hostname : $scope.deviceName,
				state : $scope.state,
				info : $scope.info,
				lastUpdated : formatedDate
		}
		$http({
	       url :'https://' + cfg.API_SERVER_HOST + ':' + cfg.API_SERVER_PORT + '/eam/v1/dna/'+$scope.hostId+'/asset?assetId='+$scope.serialNo,
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
