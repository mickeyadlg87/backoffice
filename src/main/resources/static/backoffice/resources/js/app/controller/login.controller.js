'use strict';

angular.module('backOfficeNewapp')
        .controller('signInController', function ($scope, $timeout, $localStorage, SweetAlert, $location, $http, $rootScope, user) {

            var authenticate = function (credentials, callback) {

                var headers = credentials ? {authorization: "Basic "
                            + btoa(credentials.username + ":" + credentials.password)
                } : {};

                $http.get('user', {headers: headers}).success(function (data) {
                    if (data.name) {
                        $localStorage.user = data.name;
                        $rootScope.authenticated = true;
                    } else {
                        $rootScope.authenticated = false;
                    }
                    callback && callback();
                }).error(function () {
                    $rootScope.authenticated = false;
                    callback && callback();
                });

            };

            authenticate();
            $scope.credentials = {};
            $scope.login = function () {
                $scope.success = true;
                authenticate($scope.credentials, function () {
                    if ($rootScope.authenticated) {
                        getProfileByUser($localStorage.user);
                    } else {
                        $location.path("/signin");
                        $scope.success = false;
                        SweetAlert.swal("Error!", "Su nombre de usuario o contraseña son incorrectos.", "error");
                    }
                });
            };
            
            function getProfileByUser(username) {

                user.getProfileByUsername({
                    'realm': "backoffice",
                    'userName': username
                }, function (response) {
                    if (response.hadProfile) {
                        $location.path("/");
                        $rootScope.$broadcast('userNameChange', $localStorage.user);
                        // creacion de menu de acuerdo al perfil obtenido
                        $localStorage.topNavBarMenu = createMenuByProfile(response.profiles[0], "topbar");
                        $localStorage.topNavBarMenuUnit = createMenuByProfile(response.profiles[0], "topbar.unit");
                        $localStorage.topNavBarMenuDevice = createMenuByProfile(response.profiles[0], "topbar.device");
                        $localStorage.topNavBarMenuReport = createMenuByProfile(response.profiles[0], "topbar.report");
                        $localStorage.leftNavBarMenu = createMenuByProfile(response.profiles[1], "leftbar");
                        // broadcast hacia el controlador de la barra superior
                        $rootScope.$broadcast('navBarTopByUser', $localStorage.topNavBarMenu);
                        $rootScope.$broadcast('navBarTopUnitByUser', $localStorage.topNavBarMenuUnit);
                        $rootScope.$broadcast('navBarTopDeviceByUser', $localStorage.topNavBarMenuDevice);
                        $rootScope.$broadcast('navBarTopReportByUser', $localStorage.topNavBarMenuReport);
                        $scope.error = false;
                    } else {
                        $location.path("/signin");
                        $scope.success = false;
                        SweetAlert.swal("Sin Permisos!", "Consulte al administrador", "info");
                    }
                }, function (error) {
                    console.log("error get profiles for user");
                    $location.path("/signin");
                    $scope.success = false;
                    SweetAlert.swal("Error!", "Servicio no disponible, intente mas tarde", "error");
                });
            }
            
            /**
             * 
             * @param {type} topNavBar arreglo con los perfiles del navBar
             * @param {type} group grupo al q pertenece el arreglo
             * @returns {Array}
             */
            function createMenuByProfile(topNavBar, group) {
                var options = new Array();
                var createdMenu = new Array();
                var item = {};
                options = topNavBar.childs;
                options.map(function (obj, index) {
                    if (obj.active) {
                        item.title = obj.description;
                        item.state = obj.state;
                        if (obj.title == group) {
                            createdMenu.push(item);
                        }
                    }
                    item = {};
                });
                return createdMenu;
            }


        });
