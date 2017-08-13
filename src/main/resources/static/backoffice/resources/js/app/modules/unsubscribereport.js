'use strict';
angular.module('backOfficeNewapp')
        .config(['$stateProvider', function ($stateProvider) {
                $stateProvider
                        .state('reportUnsubscribed', {
                            url: '/reporteDadosDeBajas',
                            templateUrl: '/backoffice/resources/js/app/modules/views/unsubscribereport.view.html',
                            controller: 'unsubscribeReportController'
                        });
            }]);
