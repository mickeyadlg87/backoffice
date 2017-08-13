'use strict';
angular.module('backOfficeNewapp')
        .config(['$stateProvider', function ($stateProvider) {
                $stateProvider
                        .state('unsubscribe', {
                            url: '/unsubscribe',
                            templateUrl: '/backoffice/resources/js/app/modules/views/unsubscribe.view.html',
                            controller: 'unsubscribeController'
                        });
            }]);
