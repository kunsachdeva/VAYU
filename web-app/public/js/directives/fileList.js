app.directive('fileList', function () {
    return {
        restrict: 'AE',
        scope: {
            fileFilter: '=',
            cwd: '=',
            storage: '='
        },
        replace: 'true',
        templateUrl: '/templates/fileList.html',
        controller: ['$scope', 'Vcon', function($scope, Vcon){
            console.log($scope.files, $scope.storage);
            $scope.files = $scope.storage.files;
            $scope.folders = $scope.storage.folders; 
        }],
        link: function(scope, element, attr) {
            scope.$watch("lastUpdated", function(newVal, oldVal){

            });
        }
    };
});
