//configController.js
app.controller('ConfigController', function ($scope, $rootScope, $stateParams, $state, $http, $cookies, $location, cfg) {

    $scope.username = $cookies.username;
    console.log("username---- " + $scope.username);
    if (!$scope.username) {
        $location.path('/login/');
    }
    $scope.user = $rootScope.userName;
    $scope.dnaUsername = '';
    $scope.dnahost = '';
    $scope.dnapassword = '';
    //$scope.buserName = '';
    $scope.bhost = '';
    $scope.bpassword = '';
    $scope.id = cfg.DNA_DEFAULT_ID;
    $scope.spark = '';
    $scope.sparkList = [
    		{
    		'roomName' : "DNA-POC",
    		"roomId" : "Y2lzY29zcGFyazovL3VzL1JPT00vNmY5ODRjNTAtYmIwNi0xMWU4LTlmNzgtY2ZkNmJiM2UzZWQ5"
    		},
    		{
    		'roomName' : "DNA-C-Compliance",
    		"roomId" : "Y2lzY29zcGFyazovL3VzL1JPT00vMTRiZWQ4NjAtYzg1Zi0xMWU4LWJjNmMtZWRlOWI4NmUzM2Fj"
    		}
    		];

    var generateId = function () {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 8; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    $http({
        url: 'https://' + cfg.API_SERVER_HOST + ':' + cfg.API_SERVER_PORT + '/eam/v1/dna/' + $scope.id + '/config',
        method: "GET",
        headers: { 'Content-Type': 'application/json' }
    })
    .then(function(response){
        $scope.dnahost = response.data.dna.host;
        $scope.dnaUsername = response.data.dna.username;
        $scope.bhost = response.data.blockchain.host;
        $scope.spark = response.data.spark.roomId;
        $scope.dnapassword = '';
    })
    .catch(function(response){
        $scope.dnahost = '';
        $scope.dnaUsername = '';
        $scope.bhost = '';
        $scope.spark = '';
    })

    $scope.save = function () {
        //$scope.id = generateId();
    	if($scope.dnahost == '' || $scope.dnahost == undefined){
    		alert("Please enter DNA Host");
    		return;
    	}
    	else if($scope.dnaUsername == '' || $scope.dnaUsername == undefined){
    		alert("Please enter User Name for DNA Host");
    		return;
    	}
    	else if($scope.dnapassword == '' || $scope.dnapassword == undefined){
    		alert("Please enter Password for DNA Host");
    		return;
    	}
    	else if($scope.bhost == '' || $scope.bhost == undefined){
    		alert("Please enter Block Chain Host");
    		return;
    	}
    	else if($scope.spark == '' || $scope.spark == undefined){
    		alert("Please Select Spark room to get Message");
    		return;
    	}
        var data = {
            dna: {
                host: $scope.dnahost,
                username: $scope.dnaUsername,
                password: $scope.dnapassword
            },
            blockchain: {
                host: $scope.bhost,
            },
            spark: {
            	roomId: $scope.spark
            }
        }

        console.log(data);
        $http({
            url: 'https://' + cfg.API_SERVER_HOST + ':' + cfg.API_SERVER_PORT + '/eam/v1/dna/' + $scope.id + '/config',
            method: "POST",
            data: data,
            headers: { 'Content-Type': 'application/json' }
        })
            .then(function (response) {
                // success
                console.log("success");
                console.log(response);
                alert("configuration saved successfully.");
               // $scope.reset();
                $state.transitionTo('config');
            },
                function (response) {
                    // failed
                    console.log(response);
                    console.log("failed to post");
                    alert("Error while saving configuration.");
                   // $scope.reset();
                    $state.transitionTo('config');
                }
            );
    }

    $scope.reset = function () {
        console.log("reset called");
        $scope.dnaUsername = '';
        $scope.dnahost = '';
        $scope.dnapassword = '';
        $scope.buserName = '';
        $scope.bhost = '';
        $scope.bpassword = '';
        $scope.id = '';
        $scope.spark = '';
    }
});