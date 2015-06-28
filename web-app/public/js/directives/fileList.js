app.directive('fileList', function () {
    return {
        restrict: 'AE',
        scope: {
            fileFilter: '=',
            cwd: '='
        },
        replace: 'true',
        templateUrl: '/templates/fileList.html',
        controller: ['$scope', 'Vcon', function($scope, Vcon){

            Vcon.listFiles(function(files){

                $scope.files = files.files;
                $scope.folders = files.folders;
                console.log($scope.files, $scope.folders);
            });
        }],
        link: function(scope, element, attr) {
            scope.$watch("lastUpdated", function(newVal, oldVal){

            });
        }
    };
});
