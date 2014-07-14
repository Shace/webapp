'use strict';

angular.module('shace').run(['$rootScope', 'Shace', function($rootScope, Shace) {
    /* Expose some global application data to root scope */
    $rootScope.shace = Shace;
    $rootScope.showLoadingIndicator = false;

    Shace.init();
}]);