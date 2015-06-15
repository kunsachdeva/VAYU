var app = angular.module('Vayu', ['ngResource', 'ui.router', 'ngStorage']);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
    
    $urlRouterProvider.otherwise('/');
    
    
    $locationProvider.html5Mode(false);
    $locationProvider.hashPrefix('!');
    
    $stateProvider
	    .state('home', {
            url: '/home',
            templateUrl: '/views/home/index.html',
        })
	    .state('login', {
            url: '/login',
            templateUrl: '/views/welcome/login.html'
        })
        .state('signup', {
            url: '/signup',
            templateUrl: '/views/welcome/signup.html'
        })
	    .state('files', {
            url: '/files',
            templateUrl: '/views/files/index.html'
        })
        .state('welcome', {
            url: '/',
            templateUrl: '/views/welcome/index.html'        
        })
        .state('uploads', {
            url: '/uploads',
            templateUrl: '/views/home/uploads.html'
        })
        .state('settings', {
            url: '/settings',
            templateUrl: '/views/home/settings.html'
        }).state('download', {
            url: "/download/:fileID",
            controller: function ($stateParams) {
                


            }
        });

    }]);

/*app.run(['Vcon', '$state', function (Vcon, $state){
}]);*/
