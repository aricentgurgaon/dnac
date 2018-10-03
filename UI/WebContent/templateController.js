var app = angular.module('myApp')
app.controller('TemplateController', function($scope, $rootScope, $stateParams, $state, $http,$location, $cookies) {
	$scope.username = $cookies.username;
	console.log("username---- "+ $scope.username);
	  if(!$scope.username){
		  $location.path('/login/');
	  }
	$scope.user = $rootScope.userName;
	$scope.userName = '';
	$scope.templateName = '';
	$scope.deviceTypeList = ['Cisco Catalyst 9300 Switch','Cisco ASR 1001-X Router','Cisco Catalyst38xx stack-able ethernet switch'];
	$scope.criteriaList = ['softwareType','softwareVersion','memorySize', 'reachabilityStatus'];
	$scope.criteria = $scope.criteriaList[0];
	$scope.softTypeList = ['IOS-XE'];
	$scope.softVersionList = ['16.6.1','16.6.2s'];
	$scope.memorySizeList = ['8766878','3443553','3653664'];
	$scope.reachabilityStatus = ['reachable','not reachable'];
	$scope.softypecriteria = '';
	$scope.sofvercriteria ='';
	$scope.memsizecriteria ='';
	$scope.reachstatuscriteria='';
	$scope.criteriaValue = '';

		
	var generateId = function () {
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for (var i = 0; i < 8; i++)
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	}


	$scope.save = function(){
		$scope.id = generateId();
		console.log("criteria "+$scope.criteria);
		
		if($scope.criteria == "softwareType") {
			console.log("inside softwareType  "+$scope.softypecriteria);
			$scope.criteriaValue = $scope.softypecriteria;
		}
		else if($scope.criteria == "softwareVersion"){ 
			console.log("inside softwareversion  "+$scope.sofvercriteria);
			$scope.criteriaValue = $scope.sofvercriteria;
		}
		else if($scope.criteria == "memorySize"){ 
			$scope.criteriaValue = $scope.memsizecriteria;
		}
		else if($scope.criteria == "reachabilityStatus"){ 
			$scope.criteriaValue = $scope.reachstatuscriteria;
		}else{
			console.log("inside else");
		}
		
		console.log("criteria value "+$scope.criteriaValue);

		var tempData = {
				templateName : $scope.templateName,
				deviceType : $scope.deviceType,
				criteria : $scope.criteria,
				criteriaValue : $scope.criteriaValue
		}

		console.log("id -- "+$scope.id);
		console.log("data -- ");
		console.log(tempData);
		
		$http({
	       url :'https://localhost:8380/eam/v1/dna/template?templateId='+$scope.id,
	        method: "POST",
	        data: tempData,
	        headers: {'Content-Type': 'application/json'}
	    })
	    .then(function(response) {
	            // success
	    	console.log("success");
			console.log(response);
			alert("Template Saved successfully.");
			$scope.reset();
			$state.transitionTo('template');
	        }, 
	        function(response) { // optional
	            // failed
	        	console.log(response);
				console.log("failed to post");
				alert("Error While saving Template.");
				$scope.reset();
				$state.transitionTo('template');
	        }
	    );
	}

	$scope.reset = function(){
		$scope.deviceType ='';
		$scope.templateName = '';
		$scope.softypecriteria = '';
		$scope.sofvercriteria ='';
		$scope.memsizecriteria ='';
		$scope.reachstatuscriteria='';
		$scope.criteriaValue = '';
	}
	console.log("inside template controller");
});
