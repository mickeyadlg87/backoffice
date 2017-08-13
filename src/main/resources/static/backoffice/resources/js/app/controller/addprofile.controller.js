'use strict';

angular.module('backOfficeNewapp')
        .controller('addprofileController', function ($scope, $timeout, $rootScope, $window, $localStorage, usSpinnerService, user, exportXls, DTOptionsBuilder, DTColumnDefBuilder) {

            $timeout(function () {
                usSpinnerService.spin('spinner-7');
            }, 100);

            var objData;
            var realm = "backoffice";
            var profileByUserModal = {};
            $scope.dataModal = {};
            $scope.userNameProfile = "";
            $scope.showSaveParameters = false;
            $scope.showErrorSaveParameters = false;
            
            $timeout(function () {
                getProfileByUser();
            }, 200);
            
            $scope.alertSaveParameters = [{type: 'success', msg: 'Los parámetros han sido modificados correctamente'}];
            $scope.alertErrorSaveParameters = [{type: 'danger', msg: 'Ha ocurrido un error al intentar modificar los parámetros, favor volver a intentar'}];

            
            function getProfileByUser() {
                objData = {};
                
                /**
                 * Obtiene perfil de usuario predefinido
                 */
                user.getProfileByUsername({
                    'realm': realm,
                    'userName': $localStorage.user
                }, function (response){
                    if (response.profiles) {
                        $scope.profilesUser = response;
                    } else {
                        $scope.showAletError = true;
                    }
                    usSpinnerService.stop('spinner-7');
                }, function (error){
                    console.log("error get profile by user");
                    usSpinnerService.stop('spinner-7');
                });
                
                /**
                 * Actualiza perfil a usuario custom
                 */
                $scope.updateProfileForUser = function () {
                    profileByUserModal = $scope.profilesUser;
                    profileByUserModal.userName = $scope.userNameProfile;
                    profileByUserModal.plataform = realm;
                    
                    angular.forEach(profileByUserModal.profiles, function (value, key) {
                        value.user = $scope.userNameProfile;
                    });

                    user.updateProfileUser({
                        'content': profileByUserModal
                    }, function (response) {
                        if (response.result) {
                            $scope.showSaveParameters = true;
                            $scope.showErrorSaveParameters = false;
                        } else {
                            $scope.showSaveParameters = false;
                            $scope.showErrorSaveParameters = true;
                        }
                    }, function (error) {
                        $scope.showSaveParameters = false;
                        $scope.showErrorSaveParameters = true;
                        console.log("error guardando perfil al usuario");
                    });
                };
                
                $scope.closeAlertParameters = function (index) {
                    $scope.showSaveParameters = false;
                    $scope.showErrorSaveParameters = false;
                };
                
            }
            
            
        });