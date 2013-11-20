'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {templateUrl: 'partials/home.html', controller: 'HomeController'});
  $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'LoginController'});
  $routeProvider.when('/event/new', {templateUrl: 'partials/event/new.html', controller: 'EventNewController'});
  $routeProvider.otherwise({redirectTo: '/'});
}]).
run(function($rootScope, $location) {
  $rootScope.location = $location;
});
