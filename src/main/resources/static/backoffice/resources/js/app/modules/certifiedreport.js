'use strict';
angular.module('backOfficeNewapp')
        .config(['$stateProvider', function ($stateProvider) {
                $stateProvider
                        .state('reportCertified', {
                            url: '/reporteUnidadesCertificadas',
                            templateUrl: '/backoffice/resources/js/app/modules/views/certifiedreport.view.html',
                            controller: 'certifiedReportController'
                        });
            }]);