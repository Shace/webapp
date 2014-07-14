'use strict';

angular.module('shace.controllers').
    controller('LoginController', ['$scope', '$location', '$timeout', 'Notifications', 'Shace', function ($scope, $location, $timeout, Notifications, Shace) {

        $scope.rememberMe = true;

        $scope.login = function () {
            var
                email = $scope.email,
                password = $scope.password,
                autoRenew = $scope.rememberMe
                ;

            if (email && password) {
                Shace.requestAccessToken(email, password, autoRenew).then(function () {
                    // User is logged, redirect to home
                    Shace.retrieveUserInfos().finally(function () {
                        $location.path('/');
                    });
                }, function (response) {
                    Notifications.notifyError(response.data);
                });
            }
        };

        $scope.signup = function () {
            var
                email = $scope.email,
                password = $scope.password
                ;

            if (email && password) {
                Shace.signup(email, password).then(function () {
                    $scope.login();
                }, function (response) {
                    Notifications.notifyError(response.data);
                });
            }
        };

    }]);