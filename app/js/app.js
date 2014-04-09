'use strict';

// Declare app level module which depends on filters, and services
angular.module('shace', [
    'ngCookies',
    'ngResource',
    'ui.router',
    'ui.bootstrap',
    'shace.filters',
    'shace.resources',
    'shace.services',
    'shace.directives',
    'shace.controllers'
]).
config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, $httpProvider) {
    $urlRouterProvider.otherwise('/');
    
    $stateProvider
        .state('home', { url: '/', templateUrl: 'partials/home/home.html', controller: 'HomeController'})
        .state('login', { url: '/login', templateUrl: 'partials/login/login.html', controller: 'LoginController'})
        .state('logout', { url: '/logout', controller: 'LogoutController'})
        .state('me', { url: '/me', templateUrl: 'partials/users/me.html', controller: 'MeController'})
        .state('event', { url: '/events/:token', templateUrl: 'partials/events/event.html', controller: 'EventController'})
        .state('media', { url: '/events/:eventToken/medias/:id', templateUrl: 'partials/medias/media.html', controller: 'MediaController'})
    ;

/*
    $routeProvider.when('/', {templateUrl: 'partials/home.html', controller: 'HomeController'});
    $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'LoginController'});
    $routeProvider.when('/logout', {templateUrl: 'partials/home.html', controller: 'LogoutController'});
    $routeProvider.when('/me', {templateUrl: 'partials/users/me.html', controller: 'MeController'});
    $routeProvider.when('/events/new/:token', {templateUrl: 'partials/events/new.html', controller: 'EventsNewController'});
    $routeProvider.when('/events/new', {templateUrl: 'partials/events/new.html', controller: 'EventsNewController'});
    $routeProvider.when('/events/:token', {templateUrl: 'partials/events/event.html', controller: 'EventController'});
    $routeProvider.when('/events/:eventToken/medias/:id', {templateUrl: 'partials/medias/media.html', controller: 'MediaController'});
    $routeProvider.otherwise({redirectTo: '/'});
*/

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
}]).
run(['$rootScope', 'shace', function($rootScope, shace) {
    /* Expose some global application data to root scope */
    $rootScope.shace = shace;
    $rootScope.showLoadingIndicator = false;

    shace.init();
}]);
