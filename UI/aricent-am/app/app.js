//app.js
(function () {
  var app = angular.module('myApp', ['ui.router', 'ngCookies', 'base64']);

  app.run(function ($rootScope, $location, $state, $cookies) {
    if (!$cookies.username) {
      $state.transitionTo('home');
    }
  });

  app.constant("cfg", {
      //"API_SERVER_HOST": "173.39.230.185",
      "API_SERVER_HOST": "localhost",
      "API_SERVER_PORT": "8380",
      "DNA_DEFAULT_ID": "demo-id"
    }
  );

  app.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('home', {
          url: '/home',
          templateUrl: 'home.html'
        })
        .state('login', {
          url: '/login',
          templateUrl: 'login.html',
          controller: 'LoginController'
        })
        .state('logout', {
          url: '/logout',
          templateUrl: 'login.html',
          controller: 'LogoutController'
        })
        .state('about', {
          url: '/about',
          templateUrl: 'about.html',
          controller: 'AboutController',
        })
        .state('config', {
          url: '/config',
          templateUrl: 'config.html',
          controller: 'ConfigController'
        })
        .state('template', {
          url: '/template',
          templateUrl: 'template.html',
          controller: 'TemplateController'
        })
        .state('reports', {
          url: '/reports',
          templateUrl: 'reports.html',
          controller: 'ReportsController'
        })
        .state('assetmgmt', {
          url: '/assetmgmt',
          templateUrl: 'assetManagement.html',
          controller: 'AssetMgmtController'
        })
        .state('devaudittrail', {
          url: '/audittrail',
          templateUrl: 'deviceAuditTrail.html',
          controller: 'DeviceAuditTrailController'
        })
        .state('unfinished', {
          url: '/unfinished',
          templateUrl: 'unfinished.html'
        })
      $urlRouterProvider.otherwise('/home');
    }]);

    

})();