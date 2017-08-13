'use strict';
angular.module('backOfficeNewapp')
        .config(['$stateProvider', function ($stateProvider) {
                $stateProvider
                        .state('ratify', {
                            url: '/ratify',
                            templateUrl: '/backoffice/resources/js/app/modules/views/ratify.view.html',
                            controller: 'ratifyController'
                        });
            }]);
