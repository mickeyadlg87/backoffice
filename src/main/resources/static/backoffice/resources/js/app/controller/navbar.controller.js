'use strict';

angular.module('backOfficeNewapp')
        .controller('navBarController', function ($scope, $localStorage, $aside, $location, $http, $rootScope, $window, $state, usSpinnerService) {

            $scope.loggedUser = $localStorage.user;
            $scope.mainMenu = $localStorage.topNavBarMenu;
            $scope.menuDevice = $localStorage.topNavBarMenuDevice;
            $scope.menuUnit = $localStorage.topNavBarMenuUnit;
            $scope.menuReport = $localStorage.topNavBarMenuReport;
            //configuracion global de los spinner
            $rootScope.spinnerconfig = {
                radius: 10, width: 4, length: 10, color: 'blue'
            };

            // se acciona al momento de que el usuario es exitosamente validado
            $scope.$on('userNameChange', function (event, loggedUsername) {
                $scope.loggedUser = loggedUsername;
            });
            
            // obtener las funcionalidades del menu principal
            $scope.$on('navBarTopByUser', function (event, profilesMenu) {
                $scope.mainMenu = profilesMenu;
            });
            
            // obtener las funcionalidades del menu units
            $scope.$on('navBarTopUnitByUser', function (event, profilesUnit) {
                $scope.menuUnit = profilesUnit;
            });

            // obtener las funcionalidades del menu devices
            $scope.$on('navBarTopDeviceByUser', function (event, profilesDevice) {
                $scope.menuDevice = profilesDevice;
            });
            
            // obtener las funcionalidades del menu reportes
            $scope.$on('navBarTopReportByUser', function (event, profilesReport) {
                $scope.menuReport = profilesReport;
            });

            $scope.asideState = {
                open: false
            };

            $scope.openAside = function (position, backdrop) {
                $scope.asideState = {
                    open: true,
                    position: position
                };

                function postClose() {
                    $scope.asideState.open = false;
                }

                $aside.open({
                    templateUrl: '/backoffice/resources/js/app/modules/views/sideBar.html',
                    placement: position,
                    size: 'sm',
                    backdrop: backdrop,
                    controller: 'sideBarController'
                }).result.then(postClose, postClose);
            };            

            this.isActive = function (state) {
                if (state !== undefined) {
                    return state.split('.')[0] === $state.current.name.split('.')[0];
                }
            };
            this.logout = function () {
                $http.post('/logout', {}).success(function () {
                    $state.go('logout');
                    $rootScope.authenticated = false;
                    deleteLocalStorage();
                }).error(function (data) {
                    $state.go('logout');
                    $rootScope.authenticated = false;
                    deleteLocalStorage();
                });
            };
            
            /**
             * elimina las variables almacenadas en el local storage
             * @returns {undefined}
             */
            function deleteLocalStorage() {
                $localStorage.$reset();
            }
            
        });
