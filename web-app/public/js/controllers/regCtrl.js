app.controller('regCtrl', ['$scope', '$resource', '$state', '$http', 'Vcon', function ($scope, $resource, $state, $http, Vcon) {
        
        $scope.Register = function () {

            var user = {
                name: {
                    first: $scope.firstName,
                    last: $scope.lastName
                },
                email: $scope.email,
                password: $scope.password
            };
            
            Vcon.Register(user , function (success) {
                if (success) {
                    
                    
                    
                    
                } else {
                    console.log("nope");
                }
            });

        };
}]);