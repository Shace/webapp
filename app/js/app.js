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
  $routeProvider.when('/about', {templateUrl: 'partials/about.html', controller: 'AboutController'});
  $routeProvider.when('/contact', {templateUrl: 'partials/contact.html', controller: 'ContactController'});
  $routeProvider.otherwise({redirectTo: '/'});
}]).
run(function($rootScope, $location) {
  $rootScope.location = $location;
});
