'use strict';
angular.module('backOfficeNewapp')
        .config(['$stateProvider', function ($stateProvider) {
                $stateProvider
                        .state('logout', {
                            url: '/backoffice/logout',
                            templateUrl: '/backoffice/resources/js/app/modules/views/logout.provisional.html'
                        });
            }]);


