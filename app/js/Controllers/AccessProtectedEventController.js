'use strict';

angular.module('shace.controllers').
    controller('AccessProtectedEventController',
    ['$scope', '$modalInstance', '$state', 'Events', 'Notifications',
        function ($scope, $modalInstance, $state, Events, Notifications) {
            $scope.form = {
                password: ''
            };

            $scope.submit = function () {
                var
                    token = $scope.eventToken,
                    password = $scope.form.password
                ;

                $scope.passwordInvalid = false;

                if (!password) {
                    $scope.passwordInvalid = true;
                }

                Events.access({token: token}, {password: password},
                    function(response) {
                        $state.go('event.medias.rootBucket', {token: token}, {reload: true});
                        $modalInstance.close();
                    },
                    function (response) {
                        $scope.passwordInvalid = true;
                    }
                );
            };
        }]);