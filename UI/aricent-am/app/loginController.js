//loginController-js 
var app = angular.module('myApp');
app.controller('LoginController', function ($scope, $rootScope, $stateParams, $state, $cookies, LoginService) {
    $rootScope.title = "CDNA Login";
    if ($rootScope.userName && $cookies.username) {
        $rootScope.userName = '';
        $cookies.username = '';
    }
    $scope.formSubmit = function () {

        LoginService.login($scope.username, $scope.password)
            .then(function (isValidated) {
                if (isValidated) {
                    $rootScope.userName = $scope.username;
                    $cookies.username = $scope.username;
                    $scope.error = '';
                    $scope.username = '';
                    $scope.password = '';
                    $state.transitionTo('home');
                } else {
                    $scope.error = "Incorrect username/password !";
                }
            })
            .catch(function (data) {
                $scope.error = "Opps! Internal server error. Please try again.";
            })
    }
});