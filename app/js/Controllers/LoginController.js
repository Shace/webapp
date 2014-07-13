'use strict';

angular.module('shace.controllers').
    controller('LoginController', ['$scope', '$location', '$timeout', 'Notifications', 'shace', function ($scope, $location, $timeout, Notifications, shace) {

        $scope.rememberMe = true;

        $scope.login = function () {
            var
                email = $scope.email,
                password = $scope.password,
                autoRenew = $scope.rememberMe
                ;

            if (email && password) {
                shace.requestAccessToken(email, password, autoRenew).then(function () {
                    // User is logged, redirect to home
                    shace.retrieveUserInfos().finally(function () {
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
                shace.signup(email, password).then(function () {
                    $scope.login();
                }, function (response) {
                    Notifications.notifyError(response.data);
                });
            }
        };

    }]);