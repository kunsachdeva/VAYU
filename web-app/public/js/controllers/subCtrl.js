app.controller('subCtrl', ['$scope', '$resource', function ($scope, $resource) {

        var Subscriber = $resource('/subscribe');
        
        $scope.Subscribe = function () {
            var subscriber = new Subscriber();
            subscriber.name = $scope.name;
            subscriber.email = $scope.email;
            subscriber.$save();
            $scope.sub = 1;
        };
        $scope.clicked = false;
        $scope.sub = 0;
}]);