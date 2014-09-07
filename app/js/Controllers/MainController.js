'use strict';

angular.module('shace.controllers').controller('MainController',
    ['$scope', '$rootScope', '$translate', '$sce', 'Shace', 'AccessToken',
        function ($scope, $rootScope, $translate, $sce, Shace, AccessToken) {

    $scope.isHome = true;
    $scope.currentState = undefined;

    $scope.$on('$stateChangeSuccess', function (event, state) {
        $scope.isHome = (state.controller === 'HomeController');
        $scope.currentState = state;
    });

    $scope.keyboardAction = function (event) {
        $scope.$broadcast('keyboadAction', event);
    };

    $scope.changeLanguage = function (lang) {
        Shace.accessToken.lang = lang;
        Shace.lang = lang;
        Shace.storeAccessToken();
        $translate.use(lang);

        // Store lang server side
        AccessToken.changeLanguage({'language':lang}, {});
    }

    // Home video
    $scope.homeVideoSrc = '';
    $rootScope.$on('$translateChangeSuccess', function() {
        $translate('HOME_VIDEO_URL').then(function(t) {
            $scope.homeVideoSrc = $sce.trustAsResourceUrl(t);
        });
    });
}]);
