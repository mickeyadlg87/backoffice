'use strict';
angular.module('backOfficeNewapp')
        .config(['$stateProvider', function ($stateProvider) {
                $stateProvider
                        .state('potacommand', {
                            url: '/potaCommand',
                            templateUrl: '/backoffice/resources/js/app/modules/views/potacommand.view.html',
                            controller: 'potacommandController'
                        });
            }]);
