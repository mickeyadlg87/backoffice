'use strict';
angular.module('backOfficeNewapp')
        .config(['$stateProvider', function ($stateProvider) {
                $stateProvider
                        .state('reportKeepAlive', {
                            url: '/reporteKeepAlive',
                            templateUrl: '/backoffice/resources/js/app/modules/views/reportKeepAlive.view.html',
                            controller: 'keepAliveController'
                        });
            }]);