app.controller('userCtrl', ['$scope', 'Vcon', '$state', '$http', function ($scope, Vcon, $state, $http) { 
        
        //$scope.user = Vcon.returnUser();
        //$scope.cwd = $scope.user.home;
    
       // Vcon.getSession(function (success){
       //     if(success)
       //     {
       //         $scope.user = Vcon.returnUser();
       //         $scope.cwd = Vcon.returnCwd();
       //     
       //         console.log($scope.user);
       //     }else{
       //         console.log(success);
       //     }
       // });

        /*Vcon.getStorage($scope.user.home, function (data){
            $scope.user.storage = data;
            console.log($scope.user.storage, 'ey');
        });*/


        $scope.download = function(id) {
            $http.get('http://localhost:1338/download/' + id, {
                headers : {
                    'Authorization' : 'Basic ' + btoa($scope.user.id + ':' + $scope.user.key)
                }
            })
            .success(function(data){
                window.location = 'http://localhost:1337/api/files/download/' + id + '/' + $scope.user.id;
            });
        };

        $scope.updateProfile = function(){
            var newDetails = $scope.user;
        };
      
        $scope.uploadClick = function() {
            angular.element('#upload').trigger('click');
        };

        $scope.newFolder = function() {
            Vcon.newFolder(function(success){
            
                console.log('eyey');
            });
        };


}]);
