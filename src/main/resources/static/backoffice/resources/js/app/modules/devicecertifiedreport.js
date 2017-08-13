'use strict';
angular.module('backOfficeNewapp')
        .config(['$stateProvider', function ($stateProvider) {
                $stateProvider
                        .state('reportDeviceCertified', {
                            url: '/reporteDispositivosCertificados',
                            templateUrl: '/backoffice/resources/js/app/modules/views/reportdevicecertified.view.html',
                            controller: 'reportDeviceCertifiedController'
                        });
            }]);
