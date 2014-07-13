'use strict';

angular.module('shace.controllers').
    controller('EventPrivacyOptionsController',
    ['$scope', '$state', '$modalInstance', 'Notifications',
        function ($scope, $state, $modalInstance, Notifications) {
            $scope.view = 'modes';

            $scope.privacy = $scope.event.privacy;

            function initForm() {
                $scope.form = {
                    loading: false,
                    showToken: false,
                    token: '',
                    password: '',
                    passwordConfirm: ''
                };
            }

            initForm();

            $scope.selectPrivacy = function (privacy) {
                $scope.privacy = privacy;
            };

            $scope.changePrivacy = function (privacy) {
                initForm();
                if ((privacy === 'public' || privacy === 'protected') && $scope.event.privacy === 'private') {
                    $scope.form.showToken = true;
                }
                $scope.view = 'form-'+privacy;
            };

            $scope.submitForm = function () {
                var
                    eventCopy = angular.copy($scope.event),
                    tokenChanged = false
                    ;

                if ($scope.view === 'modes') {
                    return;
                }

                if (($scope.privacy === 'public' || $scope.privacy === 'protected') && $scope.event.privacy === 'private') {
                    $scope.tokenInvalid = false;

                    if (!$scope.form.token) {
                        $scope.tokenInvalid = true;
                        return;
                    }
                    $scope.event.token = $scope.form.token;
                    tokenChanged = true;
                }

                if ($scope.privacy === 'protected') {
                    $scope.passwordInvalid = false;
                    $scope.passwordMatchInvalid = false;

                    if (!$scope.form.password) {
                        $scope.passwordInvalid = true;
                        return;
                    }
                    else if ($scope.form.password !== $scope.form.passwordConfirm) {
                        $scope.passwordMatchInvalid = true;
                        return;
                    }
                    $scope.event.password = $scope.form.password;
                } else if ($scope.privacy === 'private') {
                    tokenChanged = true;
                }

                $scope.event.privacy = $scope.privacy;

                $scope.form.loading = true;
                $scope.event.$update({token: eventCopy.token}).then(function(response){
                    $scope.form.loading = false;
                    $scope.view = 'modes';
                    Notifications.notifySuccess('Event privacy changed successfully');
                    if (tokenChanged) {
                        $state.go('event.medias.rootBucket', {token: response.token});
                    }
                    $modalInstance.close();
                }, function (response) {
                    $scope.form.loading = false;
                    Notifications.notifyError(response.data);
                    $scope.event = eventCopy;
                });
            };

        }]);