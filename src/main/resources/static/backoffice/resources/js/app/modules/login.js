'use strict';
angular.module('backOfficeNewapp')
        .config(['$stateProvider', function ($stateProvider) {
                $stateProvider
                        .state('login', {
                            url: '/signin',
                            templateUrl: '/backoffice/resources/js/app/modules/views/login.view.html',
                            controller: 'signInController'
                        });
            }]);


