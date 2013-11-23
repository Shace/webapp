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
          $location.path('/');
        });
      }
    };
    
  }]).
  controller('EventNewController', [function () {
    
  }])
;