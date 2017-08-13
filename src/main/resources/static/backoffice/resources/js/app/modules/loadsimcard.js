'use strict';
angular.module('backOfficeNewapp')
        .config(['$stateProvider', function ($stateProvider) {
                $stateProvider
                        .state('loadsimcard', {
                            url: '/cargaSimcard',
                            templateUrl: '/backoffice/resources/js/app/modules/views/loadSimcard.view.html',
                            controller: 'loadSimCardController'
                        });
            }]);