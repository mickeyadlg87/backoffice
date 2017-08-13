'use strict';

angular.module('backOfficeNewapp')
        .controller('sideBarController', function ($scope, $uibModalInstance, $state, $rootScope, $localStorage) {

//          Obtener las funcionalidades del usuario para menu izquierdo,  
//          estan definidas desde el momento del login controller
            $scope.menuSideBar = $localStorage.leftNavBarMenu;

            $scope.estaActivo = function (state) {
                if (state !== undefined) {
                    return state.split('.')[0] === $state.current.name.split('.')[0];
                }
            };

            $scope.okey = function (e) {
                $uibModalInstance.close();
                e.stopPropagation();
            };
            $scope.cancelation = function (e) {
                $uibModalInstance.dismiss();
                e.stopPropagation();
            };
        });
