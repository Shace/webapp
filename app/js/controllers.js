'use strict';

/* Controllers */

angular.module('shace.controllers', []).
  controller('HomeController', [function () {
    
  }]).
  controller('LoginController', ['$scope', '$location', 'shace', function ($scope, $location, shace) {
    
    $scope.login = function (email, password) {
      if (email && password) {
        shace.requestAccessToken(email, password).then(function () {
          // User is logged, redirect to home
          shace.retrieveUserInfos().finally(function () {;
            $location.path('/');
          });
        });
      }
    };
    
    $scope.signup = function (email, password) {
      if (email && password) {
        shace.signup(email, password).then(function () {
          $scope.login(email, password);
        });
      }
    };
    
  }]).
  controller('LogoutController', ['$scope', '$location', 'shace', function ($scope, $location, shace) {
    
    shace.logout();    
    $location.path('/');
    
  }]).
  controller('MeController', ['$scope', '$location', '$filter', 'shace', function ($scope, $location, $filter, shace) {
    var birth_date;
    
    $scope.$watch('shace.user', function (newValue) {
      if (newValue.birth_date) {
        $scope.birth_date = $filter('date')(newValue.birth_date, 'yyyy-MM-dd');
      }      
    });
    
    $scope.saveUser = function () {
      if ($scope.password) {
        shace.user.password = $scope.password;
        $scope.password = '';
      }
      birth_date = (new Date($scope.birth_date)).getTime();
      if (birth_date) {
        shace.user.birth_date = birth_date;
      }
      shace.user.$update();
    };
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
      $scope.event.$update({token: $scope.event.token});
    };
  }])
;