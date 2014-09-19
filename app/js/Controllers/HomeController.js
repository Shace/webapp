'use strict';

angular.module('shace.controllers').controller('HomeController',
    ['$scope', '$q', '$state', '$modal', '$location', '$document', 'Notifications', 'Events',
        function ($scope, $q, $state, $modal, $location, $document, Notifications, Events) {

            /*
             * Return auto-completed actions for input token
             */
            $scope.getInputTokenActions = function(inputToken) {
                
                var
                    deferred = $q.defer(),
                    actions = [],
                    createAction, createPrivateAction
                    ;

                // Add create actions
                createAction = {
                    type: 'create',
                    token: inputToken
                };
                createPrivateAction = {
                    type: 'create-private',
                    token: inputToken
                };

                // Check if an event with the given token exists
                Events.get({token:inputToken},
                    // Success handler
                    function(response) {
                        createAction.enabled = false;
                        actions.push({
                            type: 'access',
                            token: response.token,
                            event: response
                        });
                        actions.push(createPrivateAction);
                        deferred.resolve(actions);
                    },
                    // Error handler
                    function(response) {
                        if (response.status === 403) {
                            actions.push({
                                type: 'access',
                                token: inputToken,
                                privacy: 'protected'
                            });
                            createAction.enabled = false;
                            actions.push(createPrivateAction);
                        } else {
                            actions.push(createAction);
                        }
                        deferred.resolve(actions);
                    });
                return deferred.promise;
            };

            /*
             * Handler of input token select event
             */
            $scope.inputTokenActionSelected = function () {

                var action = $scope.inputToken;

                if (!action) {
                    return ;
                }
                if (action.type === 'create') {
                    $scope.createEvent('public', action.token);
                } else if (action.type === 'create-private') {
                    $scope.createEvent('private', action.token);
                } else if (action.type === 'access') {
                    if (action.privacy === 'protected') {
                        $scope.eventToken = action.token;
                        $modal.open({
                            controller: 'AccessProtectedEventController',
                            templateUrl: '../../partials/components/access-protected.html',
                            scope: $scope
                        });
                    } else {
                        $state.go('event.medias.rootBucket', {token: action.token});
                    }
                }

            };

            /*
             * Access an event with a given token
             */
            $scope.accessEvent = function (token) {
                if (token) {
                    Events.get({token: token},
                        // Success handler
                        function(response) {
                            $state.go('event.medias.rootBucket', {token: token});
                        },
                        // Error handler
                        function (response) {
                            Notifications.notifyError(response.data);
                        });
                }
            };

            /*
             * Create an event and redirect to the event page
             */
            $scope.createEvent = function(privacy, token) {
                var name = 'Untitled event';

                Events.save({}, {token: token, privacy: privacy, name:name}, function (event) {
                    $state.go('event.medias.rootBucket', {token: event.token});
                }, function (response) {
                    Notifications.notifyError(response.data);
                });
            };
            
            $scope.gotoBottom = function() {
                var element = angular.element(document.getElementById('more'));
                $document.scrollToElement(element, 0, 700);
            };
            
        }]);
