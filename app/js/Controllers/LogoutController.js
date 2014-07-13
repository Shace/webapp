'use strict';

angular.module('shace.controllers').
controller('LogoutController', ['$scope', '$location', 'shace', function ($scope, $location, shace) {
    shace.logout();
    $location.path('/');
}]);