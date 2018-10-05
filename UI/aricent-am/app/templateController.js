var app = angular.module('myApp')
app.controller('TemplateController', function($scope, $rootScope, $stateParams, $state, $http,$location, $cookies, cfg) {
    $scope.username = $cookies.username;
    console.log("username---- "+ $scope.username);
      if(!$scope.username){
          $location.path('/login/');
      }
    $scope.user = $rootScope.userName;
    $scope.userName = '';
    $scope.templateName = '';
    $scope.deviceTypeList = ['Cisco Catalyst 9300 Switch','Cisco ASR 1001-X Router','Cisco Catalyst38xx stack-able ethernet switch'];
    $scope.criteriaList = ['softwareType','softwareVersion'];
    $scope.criteria = $scope.criteriaList[0];
    $scope.softTypeList = ['IOS-XE'];
    $scope.softVersionList = ['16.6.1','16.6.2s','16.6.4'];
    $scope.softypecriteria = '';
    $scope.sofvercriteria ='';
    $scope.criteriaValue = '';
    $scope.description = '';

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
		if($scope.templateName == '' || $scope.templateName == undefined){
			alert("Please Enter template Name");
			return;
		}
		if($scope.deviceType == '' || $scope.deviceType == undefined){
			alert("Please Enter Asset Type");
			return;
		}
		if($scope.criteria == '' || $scope.criteria == undefined){
			alert("Please Select Criteria");
			return;
		}
		
		if($scope.criteria == "softwareType") {
			$scope.criteriaValue = $scope.softypecriteria;
		}
		else if($scope.criteria == "softwareVersion"){ 
			$scope.criteriaValue = $scope.sofvercriteria;
		}
		else{
			alert("select a criteria");
		}
		
		if($scope.criteriaValue == '' || $scope.criteriaValue == undefined){
			alert("Please Select Criteria Value");
			return;
		}
		
		var tempData = {
				name : $scope.templateName,
				deviceType : $scope.deviceType,
				criteria : $scope.criteria,
				criteriaValue : $scope.criteriaValue,
				description : $scope.description
		}
		
		$http({
	       url :'https://' + cfg.API_SERVER_HOST + ':' + cfg.API_SERVER_PORT + '/eam/v1/dna/template?templateId='+$scope.id,
	        method: "POST",
	        data: tempData,
	        headers: {'Content-Type': 'application/json'}
	    })
	    .then(function(response) {
	            // success
	    	console.log("success");
			alert("Template Saved successfully.");
			$scope.reset();
			$state.transitionTo('template');
	        }, 
	        function(response) {
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
        $scope.criteriaValue = '';
        $scope.description = '';
    }
});
