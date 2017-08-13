'use strict';
angular.module('backOfficeNewapp')
        .config(['$stateProvider', function ($stateProvider) {
                $stateProvider
                        .state('user', {
                            url: '/usuarios',
                            templateUrl: '/backoffice/resources/js/app/modules/views/user.view.html',
                            controller: 'userController'
                        });
            }]);




