'use strict';

/*
 * Set a custom validation message based on a custom
 * validation function for form input
 */
angular.module('shace.directives').
    directive('customValidation', ['$timeout', function($timeout) {
        return {
            link: function(scope, elem, attrs) {
                var
                    predicate = attrs['customValidation']
                ;

                scope.$watch(predicate, function (predicateValue) {
                    var msg = scope.$eval(attrs['customValidationMessage']);

                    if (!predicateValue) {
                        elem.get(0).setCustomValidity(msg);
                    } else {
                        elem.get(0).setCustomValidity('');
                    }
                });
            }
        };
    }]);