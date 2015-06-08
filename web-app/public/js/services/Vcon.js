app.service('Vcon', ['$http', '$state', function ($http, $state) {
        //var port = window.location.port;
        //var base = "http://vcon-test.herokuapp.com";
        var base = 'http://localhost:1337';
        var user = {};
        user.name = {};

        //$scope.$storage = $sessionStoragenpm

        this.checkUser = function(callback){

            $http.get('/session').success(function (data){
                console.log(data);
                user.id = data._id;
                user.name = data.name;
                user.email = data.email;
                user.key = data.ApiKey;


                if(callback)
                    return callback(true);

            }).error(function (data) {

                console.log(data);
                user = {};

                if($state.current === "home")
                    $state.go('welcome');

                if(callback)
                    return callback(false);

            });
        };

        
        var loggedIn = false;

        //retrieve user storage
        this.getStorage = function (callback){

            var files = [];
            $http.get(base + '/files/' + user.id,{
                headers: {
                    'Authorization' : 'Basic ' + btoa(user.id + ':' + user.key)
                }
            }).success(function (data){
                callback(data);
            });        

        };

        this.deleteFile = function(data, callback){
            console.log(data);

            $http.delete(base + '/files/' + data,{
                headers: {
                    'Authorization' : 'Basic ' + btoa(user.id + ':' + user.key)
                }
            }).success(function (data){});

        };


        this.Login = function (data, callback) {
            

            $http.get(base + '/users', {
                headers : {
                    'Authorization' : 'Basic ' + btoa(data.email + ':' + data.password)
                }
            }).success(function (data) {
                $http.post('/session', data);
                user.id = data._id;
                user.name = data.name;
                user.email = data.email;
                user.key = data.ApiKey;
                                
                //return true to client
                return callback(true);

            }).error(function (data) { 
                //return false to client
                return callback(false);                
            });

        };
        
        this.isLoggedIn = function (){
            
            $http.get('/reqSession').success(function (data) {
                    //send user session if logged in
                data = data.data;

                user.id = data._id;
                user.name.first = data.name.first;
                user.name.last = data.name.last;
                user.email = data.email;
                user.key = data.APIKey;
                         
            }).error(function (data) {
                    //redirect to home if not logged in
                $state.go('welcome');
                user = false;
            });
            return user;          
        };
        
        this.returnUser = function () {
            return user;
        };

        this.logout = function () {
            //$http.
        };
        
        this.uploadFile = function (data, callback)
        {
            console.log('data sent: ', data);

            /*$http.post('/files/' + user.id, data, {
                headers: { 
                    'Content-Type': false
                },
                transformRequest: angular.identity
            }).success(function (data) {

                
                return callback(true);

            }).error(function (data) {

                return callback(false);

            });*/

            $.ajax({
                url: 'http://localhost:1337/files/' + user.id,
                data: data,
                headers: {
                    'Authorization' : 'Basic ' + btoa(user.id + ':' + user.key)
                },
                processData: false,
                contentType: false,
                type: 'POST',
                success: function(data){
                    console.log(data);
                }
            });
        };
        this.APIKey = function (key) {
            $http.post('http://localhost:1337', data).success(function (data) { 
            
            });
        };
        
        this.Register = function (data) {
            $http.post(base + '/users', data).success(function (data) {
                
                console.log(data);
                
            });
        };
        
        this.UpdateProfile = function (data) {
            $http.post(base + 'users', data).success(function (data) { 
            
            });
        };

        this.newFolder = function (cwd) {
            $http.post(base + 'folder', data)
            .success(function(data) {

            });
        };
}]);
