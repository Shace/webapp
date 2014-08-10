'use strict';

angular.module('shace.controllers').controller('MainController', ['$scope', '$translate', 'Shace', 'AccessToken', function ($scope, $translate, Shace, AccessToken) {
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
        AccessToken.changeLanguage({'language':lang}, {}, function () {
            
        }, function (response) {
            deferred.reject(response);
        });
    }
}]);
