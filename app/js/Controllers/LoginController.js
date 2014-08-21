'use strict';

angular.module('shace.controllers').
    controller('LoginController', ['$scope', '$location', '$timeout', 'Notifications', 'Shace', function ($scope, $location, $timeout, Notifications, Shace) {

        $scope.rememberMe = true;
        $scope.error = null;

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
                        if (Notifications.redirection) {
                            $location.path(Notifications.redirection);
                            Notifications.redirection = undefined;
                        } else {
                            $location.path('/');
                        }
                    });
                }, function (response) {
                    Notifications.notifyError(response.data);
                    $scope.error = response.data.error;
                });
            }
        };

    }]);
