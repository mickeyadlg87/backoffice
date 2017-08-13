'use strict';
angular.module('backOfficeNewapp')
        .config(['$stateProvider', function ($stateProvider) {
                $stateProvider
                        .state('dispositivo', {
                            url: '/dispositivos',
                            templateUrl: '/backoffice/resources/js/app/modules/views/device.view.html',
                            controller: 'devController'
                        });
            }]);
