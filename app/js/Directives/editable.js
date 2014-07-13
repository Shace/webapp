'use strict';

/*
 * In-place editable content
 */
angular.module('shace.directives').
    directive('editable', ['$timeout', function($timeout) {
        return {
            restrict: 'E',
            templateUrl: '../../partials/components/editable.html',
            transclude: true,
            scope: {
                model: '=',
                placeholder: '@',
                onEdit: '&',
                enabled: '&'
            },
            link: function (scope, element, attrs) {

                // Private functions

                function setEnabled(enabled) {
                    if (enabled) {
                        element.find('.editable-content').addClass('enabled');
                    } else {
                        scope.cancel();
                        element.find('.editable-content').removeClass('enabled');
                    }
                }

                function isEnabled() {
                    var enabled = scope.enabled();
                    if (angular.isUndefined(enabled)) {
                        enabled = true;
                    }
                    return enabled;
                }

                scope.edit = function () {
                    if (scope.editing || !isEnabled()) {
                        return;
                    }

                    scope.editing = true;
                    scope.editedContent = scope.model;
                };

                scope.save = function () {
                    if (!scope.editedContent || !isEnabled()) {
                        return ;
                    }

                    scope.model = scope.editedContent;
                    $timeout(function() {
                        var promise = scope.onEdit();

                        // If callback return a promise, update the ui
                        // after promise is resolved
                        if (promise && promise.then) {
                            promise.then(function() {
                                scope.editing = false;
                            });
                        } else {
                            scope.editing = false;
                        }
                    });
                };

                scope.cancel = function () {
                    $timeout(function() {
                        scope.editing = false;
                    });
                };

                scope.keydown = function (event) {
                    if (event.keyCode === 27) { // Echap key
                        scope.cancel();
                    }
                };

                // Watch enabled condition
                scope.$watch('enabled()', function (newVal) {
                    setEnabled(newVal);
                });

                // Init
                setEnabled(isEnabled());
            }
        };
    }]);