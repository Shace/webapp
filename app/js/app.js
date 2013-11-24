'use strict';


// Declare app level module which depends on filters, and services
angular.module('shace', [
  'ngRoute',
  'ngCookies',
  'ngResource',
  'shace.filters',
  'shace.resources',
  'shace.services',
  'shace.directives',
  'shace.controllers'
]).
config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
  $routeProvider.when('/', {templateUrl: 'partials/home.html', controller: 'HomeController'});
  $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'LoginController'});
  $routeProvider.when('/logout', {templateUrl: 'partials/home.html', controller: 'LogoutController'});
  $routeProvider.when('/me', {templateUrl: 'partials/users/me.html', controller: 'MeController'});
  $routeProvider.when('/events/new', {templateUrl: 'partials/events/new.html', controller: 'EventsNewController'});
  $routeProvider.when('/events/:token', {templateUrl: 'partials/events/event.html', controller: 'EventController'});
  $routeProvider.otherwise({redirectTo: '/'});
  
  // HTTP interceptor
  $httpProvider.interceptors.push(['$q', '$rootScope', function($q, $rootScope) {
    return {
      'request': function(config) {
        // Auto inject access token if available
        if (
          (!config.params
            || (config.params
            && angular.isUndefined(config.params.access_token)
          ))
          && $rootScope.shace.accessToken) {
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
run(function($rootScope, $location, shace) {
  /* Expose some global application data to root scope */
  $rootScope.location = $location;  
  $rootScope.shace = shace;
  $rootScope.showLoadingIndicator = false;

  shace.init();
});
