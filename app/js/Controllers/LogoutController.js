'use strict';

angular.module('shace.controllers').
controller('LogoutController', ['$scope', '$location', 'Shace', function ($scope, $location, Shace) {
    Shace.logout();
    $location.path('/');
}]);