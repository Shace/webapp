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
    }]).
    
    /*
     * Shows a localized date interval between two timestamps
     */
    directive('dateInterval', ['$filter', function($filter) {
        return {
            restrict: 'E',
            scope: {
                begin: '=',
                end: '=',
                full: '='
            },
            link: function (scope, elem, attrs) {
                var
                    dateFormatter = $filter('date'),
                    full = angular.isDefined(scope.full) ? scope.full : false
                ;
                
                full = full ? 'Full' : '';
                
                function update() {
                    var
                        begin = scope.begin,
                        end = scope.end,
                        beginDate = new Date(begin),
                        endDate = new Date(end),
                        str = ''
                    ;
                    
                    if (!begin || !end) {
                        return;
                    }
                    
                    var formats = {
                        time: 'h a',
                        day: 'd',
                        month: 'MMMM',
                        year: 'MMMM yyyy',
                        dateTime: 'd MMMM, h a',
                        dateTimeFull: 'd MMMM yyyy, h a',
                        
                        timeInterval: 'd MMMM, t1 - t2',
                        timeIntervalFull: 'd MMMM yyyy, t1 - t2',
                        dayInterval: 'MMMM t1 - t2',
                        dayIntervalFull: 'MMMM t1 - t2, yyyy',
                        monthInterval: 't1 - t2',
                        monthIntervalFull: 't1 - t2 yyyy',
                        yearInterval: 't1 - t2'
                    };

                    if (beginDate.getHours() === endDate.getHours()) {
                        str = dateFormatter(begin, formats['dateTime'+full]);
                    }
                    else if (beginDate.getDate() === endDate.getDate()) {
                        str = dateFormatter(begin, formats['timeInterval'+full]);
                        str = str.replace('t1', dateFormatter(begin, formats.time));
                        str = str.replace('t2', dateFormatter(end, formats.time));
                    } else if (beginDate.getMonth() === endDate.getMonth()) {
                        str = dateFormatter(begin, formats['dayInterval'+full]);
                        str = str.replace('t1', dateFormatter(begin, formats.day));
                        str = str.replace('t2', dateFormatter(end, formats.day));
                    } else if (beginDate.getYear() === endDate.getYear()) {
                        str = dateFormatter(begin, formats['monthInterval'+full]);
                        str = str.replace('t1', dateFormatter(begin, formats.month));
                        str = str.replace('t2', dateFormatter(end, formats.month));
                    } else {
                        str = dateFormatter(begin, formats.yearInterval);
                        str = str.replace('t1', dateFormatter(begin, formats.year));
                        str = str.replace('t2', dateFormatter(end, formats.year));
                    }
                    
                    elem.html(str);
                }
                
                scope.$watch('begin + end', function (newVal) {
                    update();
                });
            }
        };
    }])
;