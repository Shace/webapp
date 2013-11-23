'use strict';

/* Controllers */

angular.module('shace.controllers', []).
  controller('HomeController', [function () {
    
  }]).
  controller('LoginController', ['$scope', '$location', 'shace', function ($scope, $location, shace) {
    
    $scope.login = function () {      
      if ($scope.email && $scope.password) {        
        shace.requestAccessToken($scope.email, $scope.password).then(function () {
          // User is logged, redirect to home
          shace.retrieveUserInfos().finally(function () {;
            $location.path('/');
          });
        });
      }
    };
    
  }]).
  controller('LogoutController', ['$scope', '$location', 'shace', function ($scope, $location, shace) {
    
    shace.logout();    
    $location.path('/');
    
  }]).
  controller('EventsNewController', ['$scope', '$location', 'Events', function ($scope, $location, Events) {
    $scope.event = {
      token: '',
      privacy: 'private'
    };
    
    $scope.createEvent = function () {
      Events.save({}, $scope.event, function (event) {
        $location.path('/events/'+event.token);
      });
    };
  }]).  
  controller('EventController', ['$scope', '$route', 'Events', function ($scope, $route, Events) {  
    $scope.event = Events.get({token: $route.current.params.token});
    
    $scope.saveEvent = function () {
      $scope.event.$save({token: $scope.event.token}, function () {
        console.log('event saved !');
      });
    };
  }])
;