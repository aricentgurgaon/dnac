//loginController-js 
var app = angular.module('myApp');
app.controller('LogoutController', function ($scope, $rootScope, $stateParams, $state, $cookies, LoginService, cfg) {
    $rootScope.userName = '';
    $cookies.username = '';
    $state.transitionTo('login');
});