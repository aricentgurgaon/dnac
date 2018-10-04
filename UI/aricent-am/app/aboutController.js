var app = angular.module('myApp')
app.controller('AboutController', function($scope, $rootScope, $stateParams, $state, $http,$location, $cookies, cfg) {
	$scope.username = $cookies.username;
	console.log("username---- "+ $scope.username);
	  if(!$scope.username){
		  $location.path('/login/');
	  }
	
});