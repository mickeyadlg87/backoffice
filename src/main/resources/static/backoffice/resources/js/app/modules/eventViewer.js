'use strict';
angular.module('backOfficeNewapp')
        .config(['$stateProvider', function ($stateProvider) {
                $stateProvider
                        .state('eventviewer', {
                            url: '/visualizadorDeEventos',
                            templateUrl: '/backoffice/resources/js/app/modules/views/eventViewer.view.html',
                            controller: 'eventViewerController'
                        });
            }]);