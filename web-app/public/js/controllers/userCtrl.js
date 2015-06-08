app.controller('userCtrl', ['$scope', 'Vcon', '$state', '$http', function ($scope, Vcon, $state, $http) { 
        
        /*Vcon.checkUser(function (success){
            if(success)
            {
                Vcon.listFiles(function (files){
                    $scope.files = files;
                    
                console.log($scope.files);
                });
                $scope.user = Vcon.returnUser();
            }else{
                console.log(success);
            }
        });*/

        var options = false;
       
        $scope.user = Vcon.returnUser();

        //current working directory
        $scope.cwd = '';

        console.log($scope.user);

        Vcon.getStorage(function (data){
            $scope.user.storage = data;
            console.log($scope.user.storage);
        });

        $scope.listStorage = function()
        {
            Vcon.getStorage(function (data){
                $scope.user.storage = data;
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

            Vcon.uploadFile(fd, function (success) {
                
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

            Vcon.uploadFile(fd, function(success) {
                console.log(success);
            });
        }; 

        $scope.newFolder = function() {

            Vcon.newFolder($scope.cwd, function(success) {
                console.log(success);
            });

        };

}]);
