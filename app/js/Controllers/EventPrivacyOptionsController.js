'use strict';

angular.module('shace.controllers').
    controller('EventPrivacyOptionsController',
    ['$scope', '$rootScope', '$state', '$modalInstance', 'Shace', 'Config', 'Notifications', 'Events',
        function ($scope, $rootScope, $state, $modalInstance, Shace, Config, Notifications, Events) {

            function initForm() {
                $scope.form = {
                    loading: false,
                    showToken: false,
                    token: '',
                    password: '',
                    passwordConfirm: '',
                    email: ''
                };
            }

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
            
            $scope.cancel = function () {
                if ($scope.view === 'modes') {
                    $modalInstance.close();
                } else {
                    $scope.view = 'modes';
                    $scope.privacy = $scope.event.privacy;
                }
            };
            
            $scope.openPrivateOptions = function () {
                initForm();
                $scope.eventUsers = Events.users({token: $scope.event.token});
                $scope.view = 'private-options';
            };
            
            $scope.isNotCurrentUser = function (user) {
                return user.email !== Shace.user.email;
            };
            
            $scope.removeUserPermission = function (permission) {
                $scope.form.loading = true;
                Events.removeUser({token: $scope.event.token, id: permission.id}, function (res) {
                    $scope.form.loading = false;
                    $scope.eventUsers = Events.users({token: $scope.event.token});
                });
            };
            
            $scope.addUser = function () {
                if (!$scope.form.email) {
                    $scope.form.emailInvalid = true;
                    return;
                }
                // Add user permission
                $scope.form.loading = true;
                Events.addUsers({token: $scope.event.token}, {
                    permissions: [
                        {
                            email: $scope.form.email,
                            permission: 'ADMINISTRATE'
                        }
                    ]
                }, function (res) {
                    $scope.form.loading = false;
                    $scope.form.email = '';
                    $scope.eventUsers = Events.users({token: $scope.event.token});
                });
            };

            $scope.updatePermission = function (permission) {
                Events.updateUser({token: $scope.event.token}, {
                    permissions: [
                        {
                            email: permission.email,
                            permission: permission.permission
                        }
                    ]
                }, function () {

                }, function (response) {
                    // Error
                    if (response.data) {
                        Notifications.notify({
                            type: 'danger',
                            message: response.data.error.type,
                            duration: 0
                        });
                    }
                });
            };

            $scope.submitForm = function () {
                var
                    eventCopy = angular.copy($scope.event),
                    tokenChanged = false,
                    event
                ;

                if ($scope.view === 'modes') {
                    return;
                }
                
                if ($scope.view === 'private-options') {
                    $scope.addUser();
                    return;
                }

                if (($scope.privacy === 'public' || $scope.privacy === 'protected') && $scope.event.privacy === 'private') {
                    $scope.form.tokenInvalid = false;

                    if (!$scope.form.token) {
                        $scope.form.tokenInvalid = true;
                        return;
                    }
                    $scope.event.token = $scope.form.token;
                    tokenChanged = true;
                }

                if ($scope.privacy === 'protected') {
                    $scope.form.passwordInvalid = false;
                    $scope.passwordMatchInvalid = false;

                    if (!$scope.form.password) {
                        $scope.form.passwordInvalid = true;
                        return;
                    }
                    else if ($scope.form.password !== $scope.form.passwordConfirm) {
                        $scope.form.passwordMatchInvalid = true;
                        return;
                    }
                    $scope.event.password = $scope.form.password;
                } else if ($scope.privacy === 'private') {
                    tokenChanged = true;
                    $rootScope.onLoadAction = 'openPrivateOptions';
                }

                $scope.event.privacy = $scope.privacy;

                $scope.form.loading = true;
                // Do not send all event data...
                event = $scope.event;
                event.bucket = undefined;
                event.medias = undefined;
                event.$update({token: eventCopy.token}).then(function(response){
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
            
            // Init
            $scope.view = 'modes';
            $scope.privacy = $scope.event.privacy;
            
            initForm();
            
            if ($rootScope.onLoadAction == 'openPrivateOptions') {
                $scope.openPrivateOptions();
                $rootScope.onLoadAction = false;
            }

        }]);