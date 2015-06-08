app.controller('loginCtrl', ['$scope', '$resource', '$state', '$http', 'Vcon', function ($scope, $resource, $state, $http, Vcon) {
        
        $scope.Login = function () {
            
            Vcon.Login({ 'email' : $scope.email, 'password' : $scope.password }, function (success) {
                if (success) {
                    
                    $scope.user = Vcon.returnUser();
                    $state.go('home');
                } else {
                    console.log("nope");
                }
            });
        };

        //Vcon.checkUser();

}]);