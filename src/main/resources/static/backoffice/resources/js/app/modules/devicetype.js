'use strict';
angular.module('backOfficeNewapp')
        .config(['$stateProvider', function ($stateProvider) {
                $stateProvider
                        .state('devicetype', {
                            url: '/devicetype',
                            templateUrl: '/backoffice/resources/js/app/modules/views/devicetype.view.html',
                            controller: 'deviceTypeController'
                        });
            }]);


