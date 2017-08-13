'use strict';
angular.module('backOfficeNewapp')
        .config(['$stateProvider', function ($stateProvider) {
                $stateProvider
                        .state('midsearch', {
                            url: '/searchByMid',
                            templateUrl: '/backoffice/resources/js/app/modules/views/midsearch.view.html',
                            controller: 'midSearchController'
                        });
            }]);