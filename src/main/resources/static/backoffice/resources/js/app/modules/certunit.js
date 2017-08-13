'use strict';
angular.module('backOfficeNewapp')
        .config(['$stateProvider', function ($stateProvider) {
                $stateProvider
                        .state('certDevice', {
                            url: '/certificarUnidad',
                            templateUrl: '/backoffice/resources/js/app/modules/views/certunit.view.html',
                            controller: 'certUnitController'
                        });
            }]);

