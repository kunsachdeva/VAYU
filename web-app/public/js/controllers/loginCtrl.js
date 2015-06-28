app.controller('loginCtrl', ['$scope', '$resource', '$state', '$http', 'Vcon', function ($scope, $resource, $state, $http, Vcon) {
        
        $scope.Login = function () {
            
            Vcon.login({ 'email' : $scope.email, 'password' : $scope.password }, function (success) {
                if (success) 
                    $state.go('home');
                else 
                    console.log("nope");
                
            });
        };
}]);
