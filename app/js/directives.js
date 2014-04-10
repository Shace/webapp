'use strict';

/* Directives */

angular.module('shace.directives', []).
    directive('fileSelect', ['$http', function($http) {
        return {
            restrict: 'E',
            template: '<input class="file-selector-input" type="file" multiple>',
            link: function (scope, element, attrs) {
                element.find('.file-selector-input').on('change', function (event) {
                    var i, l, files = [];
                    
                    // Create a list of files from the FileList object
                    for (i = 0, l = this.files.length; i < l; i += 1) {
                        files.push(this.files[i]);
                    }
                    if (attrs.select) {
                        scope.$apply(function() {
                            scope.$eval(attrs.select, {files: files});
                        });
                    }
                });
            }
        };
    }]).
    
    /*
     * In-place editable content
     */
    directive('editable', ['$timeout', function($timeout) {
        return {
            restrict: 'E',
            templateUrl: 'partials/components/editable.html',
            transclude: true,
            scope: {
                model: '=',
                placeholder: '@',
                onEdit: '&',
                enabled: '&'
            },
            link: function (scope, element, attrs) {
                var enabled = scope.enabled();
                
                if (angular.isUndefined(enabled)) {
                    enabled = true;
                }
                
                if (!enabled) {
                    return;
                }
                
                element.find('.editable-content').addClass('enabled');
                
                scope.edit = function () {
                    if (scope.editing) {
                        return;
                    }
                    
                    scope.editing = true;
                    scope.editedContent = scope.model;
                };
                
                scope.save = function () {
                    if (!scope.editedContent) {
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
            }
        };
    }]).
    
    /*
     * Set focus on an element when a given expression
     * evaluates to true
     */
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
    }]).
    
    /*
     * Synchronise auto-filled form with their model.
     * 
     * Useful when some form elements are likely
     * to be auto-filled by the browser (login, ...)
     */
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
    }])
;