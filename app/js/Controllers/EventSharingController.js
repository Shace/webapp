'use strict';

angular.module('shace.controllers').
    controller('EventSharingController',
    ['$scope', '$location',
        function ($scope, $location) {
            $scope.eventURL = $location.absUrl();
        }]);