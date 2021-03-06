'use strict';

angular.module('shace').config(
    ['$stateProvider', '$urlRouterProvider', '$httpProvider', '$compileProvider', '$translateProvider', '$locationProvider',  
        function($stateProvider, $urlRouterProvider, $httpProvider, $compileProvider, $translateProvider, $locationProvider) {
            var language;

            // Config app states (routes)
            $urlRouterProvider.otherwise('/');
            $locationProvider.html5Mode(true);

            $stateProvider
                .state('home', { url: '/', templateUrl: 'partials/home/home.html', controller: 'HomeController'})
                .state('login', { url: '/login', templateUrl: 'partials/login/login.html', controller: 'LoginController'})
                .state('signup', { url: '/signup', templateUrl: 'partials/login/signup.html', controller: 'SignUpController'})
                .state('logout', { url: '/logout', controller: 'LogoutController'})
                .state('me', { url: '/me', templateUrl: 'partials/users/me.html', controller: 'MeController'})
                .state('invits', { url: '/invits', templateUrl: 'partials/beta/invits.html', controller: 'InvitsController'})
                .state('betadmin', { url: '/betadmin', templateUrl: 'partials/beta/admin.html', controller: 'BetaAdminController'})
                .state('feedbackadmin', { url: '/feedbackadmin', templateUrl: 'partials/beta/feedback/admin.html', controller: 'BetaFeedbackAdminController'})
                .state('feedbackadmin.feedback', { url: '/:id', templateUrl: 'partials/beta/feedback/view.html', controller: 'BetaFeedbackAdminViewController'})
                .state('event', { abstract:true, url: '/:token', templateUrl: 'partials/events/event.html', controller: 'EventController'})
                .state('event.upload', { url: '/upload', templateUrl: 'partials/events/upload.html', controller: 'EventUploadController'})
                .state('event.medias', { abstract:true, url: '', templateUrl: 'partials/events/medias.html', controller: 'EventMediasController'})
                .state('event.medias.rootBucket', { url: '', templateUrl: 'partials/events/bucket.html', controller: 'EventMediasBucketController'})
                .state('event.medias.bucket', { url: '/bucket/:bucketId', templateUrl: 'partials/events/bucket.html', controller: 'EventMediasBucketController'})
                .state('event.media', { url: '/medias/:id', templateUrl: 'partials/events/media.html', controller: 'MediaController'})
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

            // Config i18n
            $translateProvider.useStaticFilesLoader({
              prefix: '/languages/',
              suffix: '.json'
            });

            language = window.navigator.userLanguage || window.navigator.language;

            if (language) {
                language = language.split('_')[0];
                language = language.split('-')[0];
                $translateProvider.preferredLanguage(language);
            } else {
                $translateProvider.preferredLanguage('en');
            }

        }]);
