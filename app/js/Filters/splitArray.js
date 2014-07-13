'use strict';

/*
 * Splits an array into sub-arrays of maximum size
 * Useful to display elements in rows with a fixed count of columns
 */
angular.module('shace.filters').filter('splitArray', [function () {
    return function (array, subArraySize) {
        var i, l, current = [], result = [];

        for (i = 0, l = array.length; i < l; i += 1) {
            if (current.length >= subArraySize) {
                result.push(current);
                current = [];
            }
            current.push(array[i]);
        }
        result.push(current);

        return result;
    };
}]);