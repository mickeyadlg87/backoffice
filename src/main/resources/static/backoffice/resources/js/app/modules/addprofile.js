'use strict';
angular.module('backOfficeNewapp')
        .config(['$stateProvider', function ($stateProvider) {
                $stateProvider
                        .state('addProfile', {
                            url: '/addProfile',
                            templateUrl: '/backoffice/resources/js/app/modules/views/addprofile.view.html',
                            controller: 'addprofileController'
                        });
            }]);