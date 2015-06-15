app.controller('userCtrl', ['$scope', 'Vcon', '$state', '$http', function ($scope, Vcon, $state, $http) { 
        
        //$scope.user = Vcon.returnUser();
        //$scope.cwd = $scope.user.home;
    
        Vcon.isLoggedIn(function (success){
            if(success)
            {
                $scope.user = Vcon.returnUser();
                $scope.cwd = $scope.user.home;

                Vcon.listFiles(function (files){
                    $scope.files = files;
                });
            
            }else{
                console.log(success);
            }
        });

        //var options = false;

        //Set working directory to home folder
        console.log($scope.user);

       /* Vcon.getStorage($scope.user.home, function (data){
            $scope.user.storage = data;
            console.log($scope.user.storage, 'ey');
        });*/

        $scope.listStorage = function()
        {
            Vcon.getStorage(function (data){
                $scope.user.storage = data;
                console.log(data);
            });

        };
        $scope.delete = function(id)
        {
            Vcon.deleteFile(id, function(){});
        };

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

        $scope.Upload = function (){
            
            var fd = new FormData();

            fd.append('apiKey', $scope.user.key);

            $.each($('#uploadedFile')[0].files, function(i, file) {
                fd.append('file-'+i, file);
            });

            Vcon.uploadFile(fd, $scope.cwd, function (success) {
                
            });
        };

        $scope.updateProfile = function(){
            var newDetails = $scope.user;
        };
      
        $scope.uploadClick = function() {
            angular.element('#upload').trigger('click');
        };

        $scope.file_change = function(element) {
            var fd = new FormData();

            fd.append('apiKey', $scope.user.key);
            $.each($('#upload')[0].files, function(i, file) {
                fd.append('file-'+i, file);
            });

            Vcon.uploadFile(fd, $scope.cwd, function(success) {
                console.log(success);
            });
        }; 

        $scope.newFolder = function() {

            Vcon.newFolder($scope.cwd, function(success) {
                console.log(success);
            });

        };

}]);
