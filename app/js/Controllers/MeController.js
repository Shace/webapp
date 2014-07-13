'use strict';

angular.module('shace.controllers').
    controller('MeController', ['$scope', '$location', '$filter', 'Shace', function ($scope, $location, $filter, Shace) {
        var birth_date;

        $scope.$watch('Shace.user', function (newValue) {
            if (newValue.birth_date) {
                $scope.birth_date = $filter('date')(newValue.birth_date, 'yyyy-MM-dd');
            }
        });

        $scope.saveUser = function () {
            if ($scope.password) {
                Shace.user.password = $scope.password;
                $scope.password = '';
            }
            birth_date = (new Date($scope.birth_date)).getTime();
            if (birth_date) {
                Shace.user.birth_date = birth_date;
            }
            Shace.user.$update();
        };
    }]);