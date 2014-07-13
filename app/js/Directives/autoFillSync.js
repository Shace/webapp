'use strict';

/*
 * Synchronise auto-filled form with their model.
 *
 * Useful when some form elements are likely
 * to be auto-filled by the browser (login, ...)
 */
angular.module('shace.directives').
    directive('autoFillSync', ['$timeout', function($timeout) {
        return {
            require: 'ngModel',
            link: function(scope, elem, attrs, ngModel) {
                var origVal = elem.val();
                // Set timeout to handle auto-filled value
                // on page load
                $timeout(function () {
                    var newVal = elem.val();

                    if(ngModel.$pristine && origVal !== newVal) {
                        ngModel.$setViewValue(newVal);
                    }
                }, 500);
            }
        };
    }]);