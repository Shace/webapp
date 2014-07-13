'use strict';

angular.module('shace').config(
    ['$stateProvider', '$urlRouterProvider', '$httpProvider', '$compileProvider',
        function($stateProvider, $urlRouterProvider, $httpProvider, $compileProvider) {

            // Config app states (routes)
            $urlRouterProvider.otherwise('/');

            $stateProvider
                .state('home', { url: '/', templateUrl: 'partials/home/home.html', controller: 'HomeController'})
                .state('login', { url: '/login', templateUrl: 'partials/login/login.html', controller: 'LoginController'})
                .state('logout', { url: '/logout', controller: 'LogoutController'})
                .state('me', { url: '/me', templateUrl: 'partials/users/me.html', controller: 'MeController'})
                .state('event', { abstract:true, url: '/events/:token', templateUrl: 'partials/events/event.html', controller: 'EventController'})
                .state('event.upload', { url: '/upload', templateUrl: 'partials/events/upload.html', controller: 'EventUploadController'})
                .state('event.medias', { abstract:true, url: '', templateUrl: 'partials/events/medias.html', controller: 'EventMediasController'})
                .state('event.medias.rootBucket', { url: '', templateUrl: 'partials/events/bucket.html', controller: 'EventMediasBucketController'})
                .state('event.medias.bucket', { url: '/bucket/:bucketId', templateUrl: 'partials/events/bucket.html', controller: 'EventMediasBucketController'})
                .state('event.media', { url: '/medias/:id', templateUrl: 'partials/medias/media.html', controller: 'MediaController'})
            ;

            // Config compile service to allow for blob urls
            $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);

            // HTTP interceptor
            $httpProvider.interceptors.push(['$q', '$rootScope', function($q, $rootScope) {
                return {
                    'request': function(config) {
                        // Auto inject access token if available
                        if (config.url.indexOf('.html') === -1 && // Don't inject access token in template requests
                            $rootScope.shace.accessToken &&
                            (!config.params || (
                                config.params &&
                                angular.isUndefined(config.params.access_token)
                                ))) {
                            if (!config.params) {
                                config.params = {};
                            }
                            config.params.access_token = $rootScope.shace.accessToken.token;
                        }
                        $rootScope.showLoadingIndicator = true;
                        return config || $q.when(config);
                    },
                    'response': function(response) {
                        $rootScope.showLoadingIndicator = false;
                        return response || $q.when(response);
                    },
                    'responseError': function(rejection) {
                        $rootScope.showLoadingIndicator = false;
                        return $q.reject(rejection);
                    }
                };
            }]);
        }]);

//angular.module('shace').run(['$rootScope', 'shace', function($rootScope, shace) {
//    /* Expose some global application data to root scope */
//    $rootScope.shace = shace;
//    $rootScope.showLoadingIndicator = false;
//
//    shace.init();
//}]);