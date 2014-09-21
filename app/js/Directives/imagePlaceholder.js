'use strict';

/*
 * Generates a placeholder image
 * Useful when a user-provided image is not available yet
 */
angular.module('shace.directives').
    directive('imagePlaceholder', ['$timeout', function($timeout) {
        return {
            restrict: 'E',
            link: function(scope, elem, attrs, ngModel) {
                var
                    value = scope.$eval(attrs['value']),
                    text = value.substr(0, 1).toUpperCase(),
                    circle = attrs['circle'] ? scope.$eval(attrs['circle']) : false,
                    colors = [
                        '#C6F787', '#87F7C0', '#87E1F7', '#8790F7',
                        '#AF87F7', '#F78787', '#FFCF38', '#F7F287',
                        '#94D73E', '#47D791', '#24B3D5', '#686EA7',
                        '#6338AE', '#B34040', '#FDBA4E', '#FBF45A'
                    ],
                    id = attrs['id'] ? scope.$eval(attrs['id']) : value,
                    intId = parseInt(id),
                    color, i, l
                ;

                // Create basic hash if id is a string
                if (isNaN(intId)) {
                    intId = 0;
                    for (i = 0, l = id.length; i < l; ++i) {
                        intId += id.charCodeAt(i);
                    }
                }
                color = colors[intId%colors.length];
                elem.addClass('image-placeholder');
                elem.css({'background-color': color});
                if (circle) {
                    elem.html('<span class="placeholder-text"><span class="placeholder-circle">'+text+'</span></span>');
                } else {
                    elem.html('<span class="placeholder-text">'+text+'</span>');
                }

            }
        };
    }]);
