'use strict';

angular.module('shace.controllers').
    controller('LoginController',
    ['$scope', '$state', '$timeout', 'Notifications', 'Shace',
        function ($scope, $state, $timeout, Notifications, Shace) {

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
                                $state.go(Notifications.redirection.state, Notifications.redirection.params);
                                Notifications.redirection = undefined;
                            } else {
                                $state.go('home');
                            }
                        });
                    }, function (response) {
                        Notifications.notifyError(response.data);
                        $scope.error = response.data.error;
                    });
                }
            };

        }]);
