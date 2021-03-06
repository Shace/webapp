'use strict';

angular.module('shace.controllers').controller('MainController',
    ['$scope', '$rootScope', '$translate', '$sce', '$modal', 'Shace', 'AccessToken',
        function ($scope, $rootScope, $translate, $sce, $modal, Shace, AccessToken) {
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
            $scope.openVideoModal = function () {
                $modal.open({
                    templateUrl: '../../partials/home/video-modal.html',
                    windowClass: 'video-modal',
                    scope: $scope
                });
            };

            $scope.homeVideoSrc = '';
            $rootScope.$on('$translateChangeSuccess', function() {
                $translate('HOME_VIDEO_URL').then(function(t) {
                    $scope.homeVideoSrc = $sce.trustAsResourceUrl(t);
                });
            });

            // Feedback modal
            $scope.openFeedbackForm = function() {
                $modal.open({
                    controller: 'BetaFeedbackController',
                    templateUrl: 'partials/beta/feedback/modal.html',
                    scope: $scope
                });
            };
        }]);
