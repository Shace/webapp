'use strict';

angular.module('shace.controllers').
    controller('SignUpController',
    ['$scope', '$state', '$timeout', '$translate', 'Notifications', 'Shace',
        function ($scope, $state, $timeout, $translate, Notifications, Shace) {

            $scope.rememberMe = true;
            $scope.error = null;

            $scope.signup = function () {
                var
                    email = $scope.email,
                    password = $scope.password,
                    firstname = $scope.firstname,
                    lastname = $scope.lastname
                    ;

                if (email && password && firstname && lastname) {
                    Shace.signup(email, password, firstname, lastname).then(function () {
                        Shace.requestAccessToken(email, password, true).then(function () {
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
                    }, function (response) {
                        Notifications.notifyError(response.data);
                        $scope.error = response.data.error;
                    });
                }
            };

            $scope.passwordMatch = function() {
                return $scope.password === $scope.passwordConfirm;
            };

        }]);
