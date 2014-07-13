'use strict';

/*
 * Shows a localized date interval between two timestamps
 */

angular.module('shace.directives').
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
    }]);