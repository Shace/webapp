'use strict';

/*
 * Set focus on an element when a given expression
 * evaluates to true
 */
angular.module('shace.directives').
    directive('focusOn', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                scope.$watch(attrs.focusOn, function (newValue) {
                    if (newValue) {
                        $timeout(function() {
                            elem.focus();
                        });
                    }
                });
            }
        };
    }]);