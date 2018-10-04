//loginController-js 
var app = angular.module('myApp');
app.controller('LoginController', function ($scope, $rootScope, $stateParams, $state, $cookies, LoginService) {
    $rootScope.title = "CDNA Login";
    if ($rootScope.userName && $cookies.username) {
        $rootScope.userName = '';
        $cookies.username = '';
    }
    $scope.formSubmit = function () {
        if (LoginService.login($scope.username, $scope.password)) {
            console.log("validated");
            $rootScope.userName = $scope.username;
            $cookies.username = $scope.username;
            $scope.error = '';
            $scope.username = '';
            $scope.password = '';
            $state.transitionTo('about');
        } else {
            $scope.error = "Incorrect username/password !";
        }
    }
});