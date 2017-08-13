'use strict';
angular.module('backOfficeNewapp')
        .config(['$stateProvider', function ($stateProvider) {
                $stateProvider
                        .state('unidad', {
                            url: '/unidades',
                            templateUrl: '/backoffice/resources/js/app/modules/views/unit.view.html',
                            controller: 'unitController'
                        });
            }]);
