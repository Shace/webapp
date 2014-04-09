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
     * Synchronise auto-filled form with their model.
     * 
     * Useful when some form elements are likely
     * to be auto-filled by the browser (login, ...)
     */
    directive('autoFillSync', function($timeout) {
        return {
            require: 'ngModel',
            link: function(scope, elem, attrs, ngModel) {
                var origVal = elem.val();
                $timeout(function () {
                    var newVal = elem.val();
                    if(ngModel.$pristine && origVal !== newVal) {
                        //console.log(newVal);
                        ngModel.$setViewValue(newVal);
                    }
                }, 500);
            }
        };
    })
;