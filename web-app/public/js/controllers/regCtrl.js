app.controller('regCtrl', ['$scope', '$resource', '$state', '$http', 'Vcon', function ($scope, $resource, $state, $http, Vcon) {

        $scope.regFail = false; 

        $scope.register = function () {

            var user = {
                name: {
                    first: $scope.firstName,
                    last: $scope.lastName
                },
                email: $scope.email,
                password: $scope.password
            };
            
            Vcon.register(user, function (user) {
                console.log(user);
                if(user){
                    Vcon.postSession(user._id, function(callback){
                        if(callback)
                            $state.go('home');
                    });
                }
                else
                {
                    $scope.regFail = true;
                }

            });

        };
}]);
