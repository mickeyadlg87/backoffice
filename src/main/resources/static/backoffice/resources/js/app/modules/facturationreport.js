'use strict';
angular.module('backOfficeNewapp')
        .config(['$stateProvider', function ($stateProvider) {
                $stateProvider
                        .state('reportFacturation', {
                            url: '/reporteFacturacion',
                            templateUrl: '/backoffice/resources/js/app/modules/views/facturationreport.view.html',
                            controller: 'facturationReportController'
                        });
            }]);