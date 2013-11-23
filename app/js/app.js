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
  $routeProvider.when('/event/new', {templateUrl: 'partials/event/new.html', controller: 'EventNewController'});
  $routeProvider.otherwise({redirectTo: '/'});
  
  // HTTP interceptor
  $httpProvider.interceptors.push(['$q', '$rootScope', function($q, $rootScope) {
    return {
      'request': function(config) {
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
  $rootScope.location = $location;
  $rootScope.showLoadingIndicator = false;
  shace.init();
});
