//app.js
(function() {
  var app = angular.module('myApp', ['ui.router','ngCookies']);
  
   app.run(function($rootScope, $location, $state,$cookies, LoginService) {
     console.clear();
     console.log('running');
    if(!$cookies.username) {
        $state.transitionTo('login');
      }
  });
  
  app.config(['$stateProvider', '$urlRouterProvider', 
  function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('login', {
        url : '/login',
        templateUrl : 'html/login.html',
        controller : 'LoginController'
      })
      .state('about', {
        url : '/about',
        templateUrl : 'html/about.html',
        controller : 'AboutController',
      })
      .state('config', {
        url : '/config',
        templateUrl : 'html/config.html',
        controller : 'ConfigController'
      })
      .state('template', {
        url : '/template',
        templateUrl : 'html/template.html',
        controller : 'TemplateController'
      })
      .state('reports', {
        url : '/reports',
        templateUrl : 'html/reports.html',
        controller : 'ReportsController'
      })
    .state('assetmgmt',{
    	url : '/assetmgmt',
    	templateUrl : 'html/assetManagement.html',
    	controller : 'AssetMgmtController'
    })
    .state('devaudittrail',{
    	url : '/audittrail',
    	templateUrl : 'html/deviceAuditTrail.html',
    	controller : 'DeviceAuditTrailController'
    })
    console.log($stateProvider.state);
      
       $urlRouterProvider.otherwise('/login');
  }]);
 
})();