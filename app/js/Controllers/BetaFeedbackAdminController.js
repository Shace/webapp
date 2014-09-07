'use strict';

angular.module('shace.controllers').controller('BetaFeedbackAdminController',
    ['$scope', '$state', 'Shace', 'Feedbacks',
        function ($scope, $state, Shace, Feedbacks) {
            if (!Shace.user || !Shace.user.is_admin) {
                $state.go('home');
            }

            $scope.feedbacks = Feedbacks.list();
        }])
    .controller('BetaFeedbackAdminViewController',
    ['$scope', '$state', 'Shace', 'Feedbacks',
        function ($scope, $state, Shace, Feedbacks) {
            if (!Shace.user || !Shace.user.is_admin) {
                $state.go('home');
            }

            $scope.$watch('feedbacks.feedbacks', function (newVal) {
                if (!newVal) {
                    return;
                }
                var i, l;

                // Get current feedback
                for (i = 0, l = $scope.feedbacks.feedbacks.length; i < l; ++i) {
                    if ($scope.feedbacks.feedbacks[i].id === parseInt($state.params.id)) {
                        $scope.feedback = $scope.feedbacks.feedbacks[i];
                        break;
                    }
                }
            });

            $scope.processFeedback = function () {
                if (!$scope.feedback.answer) {
                    $scope.feedback.answer = '';
                }
                Feedbacks.process({}, {
                    validated: [$scope.feedback]
                }, function () {
                    $scope.feedback.adminRead = true;
                    $state.go('feedbackadmin');
                });
            }
        }]);