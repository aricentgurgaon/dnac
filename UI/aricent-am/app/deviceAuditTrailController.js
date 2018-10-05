var app = angular.module('myApp')
app.controller('DeviceAuditTrailController', function($scope, $rootScope, $stateParams, $state, $http,$location, $cookies, cfg) {
    $scope.username = $cookies.username;
    $scope.deviceList = [];
    //$scope.hostList =[];
    $scope.serialNumber	 = '';
    $scope.hostId ='';
    $scope.auditSummary = '';
    $scope.isDisabled = true;
    $scope.description = '';
      if(!$scope.username){
          $location.path('/login/');
      }
    //$scope.user = $rootScope.userName;
      
    //API to get all DNA host configured..
         $http({
                url: 'https://' + cfg.API_SERVER_HOST + ':' + cfg.API_SERVER_PORT + '/eam/v1/dna/config',
                method: "GET",
                headers: {'Content-Type': 'application/json'}
            })
            .then(function(response) {
                $scope.hostId = response.data[0]._id;
                getDevices();
                }, 
                function(error) {
                    // failed
                    console.log(error);
                    console.log("failed to get");
                });
         
         var getDevices = function(){
             $http({
                 url: 'https://' + cfg.API_SERVER_HOST + ':' + cfg.API_SERVER_PORT + '/eam/v1/dna/'+$scope.hostId+'/asset',
                 method: "GET",
                 headers: {'Content-Type': 'application/json'}
             })
             .then(function(response) {
                 console.log(response);
                 if(response.data.length>0){
                     $scope.isDisabled = false;
                 }
                 for (var i=0;i<response.data.length;i++){
                     $scope.deviceList.push(response.data[i]);
                 }
                 console.log($scope.deviceList);
             }, 
             function(error) { // optional
                 // failed
                 $scope.isDisabled = true;
                 console.log(error);
                 console.log("failed to get device");
             });
         }
      
         
      $scope.run = function(){
          if($scope.hostId !='' && $scope.serialNumber !='' && $scope.hostId != undefined && $scope.serialNumber != undefined )
          {
          $http({
                url : 'https://' + cfg.API_SERVER_HOST + ':' + cfg.API_SERVER_PORT + '/eam/v1/dna/'+$scope.hostId+'/audit?assetId='+$scope.serialNumber	,
                method: "GET",
                headers: {'Content-Type': 'application/json'}
            })
            .then(function(response) {
                    // success
                console.log("success");
                $scope.auditSummary.push(response.data);
                for (var i=0;i<response.data.length;i++){	
                	if(response.data[i].state){
                		$scope.description = response.data[i].state;
                	}else{
                		$scope.description = 'Asset Discovered to DNA-C';
                	}
                   $scope.auditSummary.push({'description' : $scope.description, 'updatedOn': response.data[i].lastUpdated});
                }
                }, 
                function(response) { // optional
                    // failed
                    console.log("failed to post");
                });
          }
          else {
              alert("Asset name is not selected");
              return;
          }
              
      }
});
