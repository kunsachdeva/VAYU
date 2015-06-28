app.service('Vcon', ['$http', '$state', function ($http, $state) {
        //var port = window.location.port;
        //var base = "http://vcon-test.herokuapp.com";
        var base = 'http://localhost:1337/api',
            base2 = 'http://localhost:1337',
            user = null,
            cwd,
            storage = {};

        //Check user ID is stored in Node.js backend
        this.getSession = function(callback){

            $http.get('/session/').success(function (data){
                user = {};
                user.id = data._id;
                user.name = data.name;
                user.email = data.email;
                user.key = data.apiKey;
                user.home = data.home;
                cwd = data.home;

                console.log(user);
                
                return callback(true);
            }).error(function (data) {
                user = null;
                return callback(false);
            });
        };

        this.postSession = function(userId, callback){
            $http.post('/session/' + userId)
                .success(function(data){
                    user = {};
                    user.id = data._id;
                    user.name = data.name;
                    user.email = data.email;
                    user.key = data.apiKey;
                    user.home = cwd = data.home;

                    return callback(true);
                }).error(function(data){
                    user = {};
                    return callback(false);
                });
        };
        
        //retrieve user storage
        this.getStorage = function (callback){
            $http.get(base + '/file/' + cwd,{
                headers: {
                    'Authorization' : 'Basic ' + btoa(user.id + ':' + user.key)
                }
            }).success(function (data){
                storage.files = data.files;
                storage.folders = data.folders;
                callback(true);
            });    

        };

        this.getShared = function(callback){

            $http.get(base + '/share', {
                headers: {
                    'Authorization' : 'Basic ' + btoa(user.id + ':' + user.key)
                }
            })
            .success(function(data){
                storage.shared = data;
                callback(true);
            });

        };

        this.deleteFile = function(fileId, callback){
            $http.delete(base + '/file/' + fileId,{
                headers: {
                    'Authorization' : 'Basic ' + btoa(user.id + ':' + user.key)
                }
            }).success(function (data){
                callback(true);
            });

        };


        this.login = function (data, callback) {

            $http.get(base2 + '/user', {
                headers : {
                    'Authorization' : 'Basic ' + btoa(data.email + ':' + data.password)
                }
            }).success(function (data) {
                $http.post('/session/' + data._id);

                user = {};

                user.id = data._id;
                user.name = data.name;
                user.email = data.email;
                user.key = data.apiKey;
                cwd = data.home;
                                
                //return true to client
                return callback(true);

            }).error(function (data) { 
                user = false;
                return callback(false);                
            });

        };
        
        this.returnCwd = function () {
            return cwd;
        };

        this.setCwd = function(val){
            cwd = val;
        };
        
        this.returnUser = function () {
            return user;
        };

        this.returnFiles = function() {
            return storage.files;
        };

        this.returnShared = function(){
            return storage.shared;
        };

        this.returnFolders = function() {
            return storage.folders;
        };

        this.logout = function () {
            //$http.
        };
        
        this.uploadFile = function (data, callback)
        {
            console.log('data sent: ', data, cwd);

            /*$http.post('/file/' + user.id, data, {
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
                url: base + '/file/' + cwd,
                data: data,
                headers: {
                    'Authorization' : 'Basic ' + btoa(user.id + ':' + user.key)
                },
                processData: false,
                contentType: false,
                type: 'POST',
                success: function(data){
                    callback(true);
                }
            });
        };
        
        this.register = function (data, callback) {
            $http.post(base2 + '/user', data).success(function (data) {
                
                callback(data);
                
            });
        };
        
        this.updateProfile = function (data) {
            $http.post(base + 'users', data).success(function (data) { 
            
            });
        };

        this.newFolder = function (callback) {
                    
            $http.post(base + '/folder/' + cwd ,{name: 'test'}, { 
                headers: {
                    'Authorization': 'Basic ' + btoa(user.id + ':' + user.key)
                },
            })
            .success(function (data) {
                console.log(data);
            });
        };

        this.shareFile = function (file, email, callback){
            $http.post(base + '/share/' + file, {email: email}, {
                headers: {
                    'Authorization': 'Basic ' + btoa(user.id + ':' + user.key)
                },
            })
            .success(function(data){
                callback(true);
            });

        };

}]);
