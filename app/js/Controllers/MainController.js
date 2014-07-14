'use strict';

angular.module('shace.controllers').controller('MainController', ['$scope', function ($scope) {
    $scope.isHome = true;
    $scope.currentState = undefined;

    $scope.$on('$stateChangeSuccess', function (event, state) {
        $scope.isHome = (state.controller === 'HomeController');
        $scope.currentState = state;
    });

    $scope.keyboardAction = function (event) {
        $scope.$broadcast('keyboadAction', event);
    };
}]);