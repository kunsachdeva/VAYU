app.service('Vcon', ['$http', '$state', function ($http, $state) {
        //var port = window.location.port;
        //var base = "http://vcon-test.herokuapp.com";
        var base = 'http://localhost:1337/api',
            base2 = 'http://localhost:1337',
            user = {},
            cwd = "";

        //Check user ID is stored in Node.js backend
        this.isLoggedIn = function(callback){

            $http.get('/session').success(function (data){
                user.id = data._id;
                user.name = data.name;
                user.email = data.email;
                user.key = data.apiKey;
                user.home = data.home;
                cwd = data.home;
                
                return callback(true);
            }).error(function (data) {
                return callback(false);
            });
        };
        
        //retrieve user storage
        this.listFiles = function (callback){

            var files = [];
            $http.get(base + '/files/' + cwd,{
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

            $http.get(base2 + '/users', {
                headers : {
                    'Authorization' : 'Basic ' + btoa(data.email + ':' + data.password)
                }
            }).success(function (data) {
                $http.post('/session', data);
                user.id = data._id;
                user.name = data.name;
                user.email = data.email;
                user.key = data.apiKey;
                                
                //return true to client
                return callback(true);

            }).error(function (data) { 
                //return false to client
                return callback(false);                
            });

        };
        
        
        this.returnUser = function () {
            return user;
        };

        this.logout = function () {
            //$http.
        };
        
        this.uploadFile = function (data, cwd, callback)
        {
            console.log('data sent: ', data, cwd);

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
                url: base + '/files/' + cwd,
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
            $http.post(base2 + '/users', data).success(function (data) {
                
                console.log(data);
                
            });
        };
        
        this.UpdateProfile = function (data) {
            $http.post(base + 'users', data).success(function (data) { 
            
            });
        };

        this.newFolder = function (parent, callback) {
            $http.post(base + 'folder/' + parent, data)
            .success(function(data) {
                
            });
        };

}]);
