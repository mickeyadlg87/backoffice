'use strict';
angular.module('backOfficeNewapp')
        .config(['$stateProvider', function ($stateProvider) {
                $stateProvider
                        .state('customer', {
                            url: '/customer',
                            templateUrl: '/backoffice/resources/js/app/modules/views/customer.view.html',
                            controller: 'customerController'
                        });
            }]);


