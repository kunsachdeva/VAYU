var app = angular.module('Vayu', ['ngResource', 'ui.router', 'ngStorage', 'ui.bootstrap']);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
    
    $urlRouterProvider.otherwise('/');
    
    
    $locationProvider.html5Mode(false);
    $locationProvider.hashPrefix('!');
    
    $stateProvider
	    .state('home', {
            url: '/home',
            views:{

                '': {
                    templateUrl: '/views/home/index.html'
                },

                'main@home':
                {
                    templateUrl: '/templates/fileList.html',
                    controller: 'fileListCtrl'
                }
                
            }
        })
        .state('shared', {
            url: '/shared',
            views: {
                
                '': {
                    templateUrl: '/views/home/index.html'
                },
                'main@shared':
                {
                    templateUrl: '/templates/sharedList.html',
                    controller: 'sharedCtrl'
                }

            }
        })
        .state('settings',{
            url: '/settings',
            views:{
                
                '': {
                    templateUrl: '/views/home/index.html'
                },

                //Show settings
                'main@settings':
                {
                    templateUrl: '/templates/settings.html',
                    controller: 'settingsCtrl'
                }
            }
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
        .state('download', {
            url: "/download/:fileID",
            controller: function ($stateParams) {
                


            }
        });

    }]);

/*app.run(['Vcon', '$state', function (Vcon, $state){
}]);*/
