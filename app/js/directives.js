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
    }])
;