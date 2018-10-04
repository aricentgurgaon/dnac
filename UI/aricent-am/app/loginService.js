//loginService.js

app.factory('LoginService', function ($http, $base64, cfg) {
    var isAuthenticated = false;
    return {
        login: function (username, password) {
            console.log("validating user  " + username);
            
            return $http({
                url: 'https://' + cfg.API_SERVER_HOST + ':' + cfg.API_SERVER_PORT + '/eam/v1/dna/login',
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Basic " + $base64.encode(username + ":" + password)
                }
            })
            .success(function(response) {
                isAuthenticated = true;
                return isAuthenticated;
            })
            .error(function (data) {
                isAuthenticated = false;
                return isAuthenticated;
            });
        },
        isAuthenticated: function () {
            return isAuthenticated;
        }
    };
});