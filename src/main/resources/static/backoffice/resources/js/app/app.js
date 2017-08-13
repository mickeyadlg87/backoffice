'use strict';

angular.module('backOfficeNewapp',
        ['ngResource',
            'ngStorage',
            'ngAnimate',
            'nvd3',
            'ui.bootstrap',
            'ui.bootstrap.datetimepicker',
            'ui.date',
            'ngTable',
            'ngRoute',
            'ngProgress',
            'isteven-multi-select',
            'angularSpinner',
            'highcharts-ng',
            'angularMoment',
            'datatables',
            'oitozero.ngSweetAlert',
            'uiSwitch',
            'ui.select',
            'ngSanitize',
            'ui.router',
            'ngAside',
            'openlayers-directive'
        ])
        //configuracion
        .config(function ($locationProvider, $urlRouterProvider, $stateProvider, $httpProvider) {
            $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            });

            $urlRouterProvider.otherwise('/customer');
            $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

        })
        .run(function ($rootScope, $localStorage, $state, $anchorScroll) {
            $rootScope.offsetTimeZone = (new Date().getTimezoneOffset()*60*1000);
            $anchorScroll.yOffset = 55;
//            $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
//                if($localStorage.user === undefined){
//                    $state.go('login');
//                };         
//            });
        });
        
        
        
        
