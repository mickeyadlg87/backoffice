'use strict';

angular.module('backOfficeNewapp')
        .controller('userController', function ($scope, SweetAlert, $rootScope, $window, usSpinnerService, user, exportXls, DTOptionsBuilder, DTColumnDefBuilder) {

            var arrayData;
            var realm = "rslite";
            var realmBack = "backoffice";
            
            var dataExport;
            var plataformSelected;
            var userNameSelected;
            var companySelected = {};
            var profileByUserModal = {};
            var successModalOperation = false;

            $scope.dataModal = {};
            $scope.dataModalInsert = {};

            $scope.realm = realm;
            $scope.showRequired = true;
            $scope.showModal = false;
            $scope.showModalCalenderized = false;
            $scope.showAletError = false;
            $scope.showAletErrorWeek = false;
            $scope.showAletErrorMonth = false;
            $scope.showAlertSendEmail = false;
            $scope.showAlertExportOk = false;
            $scope.showAletErrorExport = false;
            $scope.showAlertErrorDateSelected = false;
            $scope.showSaveParameters = false;
            $scope.showErrorSaveParameters = false;
            $scope.submenuClickOnMap = false;

            $scope.showModalProfileConfigUser = false;
            $scope.typeReport = "usuarios";

            // variables for profile edition (config)
            $scope.tableRowExpanded = false;
            $scope.tableRowIndexCurrExpanded = "";
            $scope.tableRowIndexPrevExpanded = "";
            $scope.storeIdExpanded = "";
            $scope.menuDataCollapse = [true, true, true, true, true, true, true, true];

            //se mostrara "filtro de reporte"
            $scope.filterReport = true;

            //definicion de columnas para utilizar datatables de angular
            $scope.dtOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
//                .withColVis()
//                .withColVisStateChange(function (iColumn, bVisible) {
//                    console.log('The column' + iColumn + ' has changed its status to ' + bVisible)
//                })
//                .withColVisOption('aiExclude', [3])
                    .withLanguageSource('http://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
            $scope.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0),
                DTColumnDefBuilder.newColumnDef(1),
                DTColumnDefBuilder.newColumnDef(2),
                DTColumnDefBuilder.newColumnDef(3),
                DTColumnDefBuilder.newColumnDef(4),
                DTColumnDefBuilder.newColumnDef(5).notSortable() // Editar
            ];

            //Funcion principal que recibe informacion para llamar servicio y generar reportes
            $scope.$on('search', function (event, data, rangeDate) {

                $scope.showAletErrorWeek = false;
                $scope.showAletErrorMonth = false;
                $scope.showAletError = false;
                $scope.showAlertErrorDateSelected = false;

                plataformSelected = data.plataform;
                companySelected = data.companySelected;

                getUsersbyCompany();
                // carga la info de paquetes funcionales
                getFunctionalityPackages();

            });

            $scope.$on('create', function (event, dataFiltered) {
                $scope.showModalAddUser = true;
                $scope.dataModalInsert.companyName = companySelected.name;
                $scope.dataModalInsert.functionalPackSel = undefined;
                $scope.showSaveParameters = false;
                $scope.showErrorSaveParameters = false;
                successModalOperation = false;
            });
            
            function getFunctionalityPackages() {
                var arrayFuncionPackage = new Array();
                user.getProfilesForAsigned({
                    'realm': realmBack
                }, function (response) {
                    if (response.length >= 1) {
                        arrayFuncionPackage = response;
                        $scope.functionalPackageList = arrayFuncionPackage;
                    } else {
                        $scope.functionalPackageList = [{name: 'No hay paquetes disponibles...'}];
                    }
                }, function (error) {
                    $scope.functionalPackageList = [{name: 'No hay paquetes disponibles...'}];
                    console.error("error get paquetes funcionales", error);
                });
            }

            function getUsersbyCompany() {

                var dataExportObj = {};
                var objUser = {};
                var arrayUsers = new Array();

                dataExport = new Array();
                arrayData = new Array();

                $scope.reportShow = false;
                usSpinnerService.spin('spinner-1');
                $rootScope.$broadcast('disableButtonSearch', true);
                $rootScope.$broadcast('disableButtonCreate', true);

                user.getUsersList({
                    'realm': plataformSelected,
                    'companyId': companySelected.id,
                    'sortBy': null
                }, function (data) {
                    arrayData = data;
                    if (arrayData.length >= 1) {
                        angular.forEach(arrayData, function (valueUser, key) {
                            objUser['id'] = valueUser.id;
                            objUser['rut'] = valueUser.rut;
                            objUser['userName'] = valueUser.userName;
                            objUser['password'] = valueUser.password;
                            objUser['email'] = valueUser.email;
                            objUser['name'] = valueUser.name;
                            objUser['lastName'] = valueUser.lastName;
                            objUser['phone'] = valueUser.phone;
                            objUser['realm'] = valueUser.realm;
                            objUser['profiles'] = valueUser.profiles;
                            objUser['companyId'] = valueUser.companyId;

                            /*** export to pdf - excel ***/
                            dataExportObj['Nombre'] = valueUser.name + " " + valueUser.lastName;
                            dataExportObj['R.U.T'] = valueUser.rut;
                            dataExportObj['Usuario'] = valueUser.userName;
                            dataExportObj['Telefono'] = valueUser.phone;
                            dataExportObj['e-mail'] = valueUser.email;

                            arrayUsers.push(objUser);
                            dataExport.push(dataExportObj);

                            objUser = {};
                            dataExportObj = {};
                        });
                        $scope.users = arrayUsers;
                        $scope.reportShow = true;
                    } else {
                        $scope.reportShow = false;
                        $scope.showAletError = true;
                    }
                    usSpinnerService.stop('spinner-1');
                    $rootScope.$broadcast('disableButtonSearch', false);
                    $rootScope.$broadcast('disableButtonCreate', false);
                }, function (error) {
                    usSpinnerService.stop('spinner-1');
                    console.log("error get users");
                    $scope.reportShow = false;
                    $rootScope.$broadcast('disableButtonSearch', false);
                    $rootScope.$broadcast('disableButtonCreate', false);
                    $scope.showAletError = true;
                });
            }

            $rootScope.$broadcast('disableButtonSearch', false);
            $rootScope.$broadcast('disableButtonCreate', true);
            $scope.alertsData = [{type: 'danger', msg: 'No hay datos disponible'}];
            $scope.alertsDateMonth = [{type: 'danger', msg: 'Los días seleccionados no pueden superar el mes'}];
            $scope.alertsDateWeek = [{type: 'danger', msg: 'Los días seleccionados no pueden superar una semana'}];
            $scope.alertsExport = [{type: 'danger', msg: 'Hubo problemas al exportar, por favor inténtelo nuevamente'}];
            $scope.alertsSendEmail = [{type: 'success', msg: 'El reporte fue enviado por email'}];
            $scope.alertsExportOk = [{type: 'success', msg: 'El reporte fue exportado exitosamente'}];
            $scope.alertsDate = [{type: 'danger', msg: 'La fecha final de búsqueda debe ser mayor que la fecha inicial.'}];
            $scope.alertSaveParameters = [{type: 'success', msg: 'Los parámetros han sido modificados correctamente'}];
            $scope.alertErrorSaveParameters = [{type: 'danger', msg: 'Ha ocurrido un error al intentar modificar los parámetros, favor volver a intentar'}];

            $scope.closeAlertError = function (index) {
                $scope.showAletError = false;
            };

            $scope.closeAlertSendEmail = function (index) {
                $scope.showAlertSendEmail = false;
                $scope.showAlertExportOk = false;
            };

            $scope.closeAlert = function (index) {
                $scope.showAletErrorWeek = false;
                $scope.showAletErrorMonth = false;
                $scope.showAletErrorExport = false;
                $scope.showAlertErrorDateSelected = false;
            };

            $scope.closeAlertParameters = function (index) {
                $scope.showSaveParameters = false;
                $scope.showErrorSaveParameters = false;
            };
            
            $scope.verSubMenuClickMapa = function (enabled) {
                $scope.submenuClickOnMap = !enabled;
            };

            //funcion que genera exportar reportes
            $scope.generateReport = function (type) {
                $scope.showAlertExportOk = false;
                $scope.showAlertSendEmail = false;
                $scope.showAletErrorExport = false;
                var objHeader = {};
                objHeader['Plataforma'] = plataformSelected;
                objHeader['Cliente'] = companySelected.name;
                objHeader['Fecha Generacion'] = new Date().toLocaleString();

                exportXls.postExportXls({
                    'title': "Reporte de Usuarios " + plataformSelected,
                    'header': objHeader,
                    'data': dataExport
                }, function (data) {
                    if (data.status == 1) {

                        switch (type) {
                            case 'xls':
                                $window.open('export/xls', '_blank');
                                break;
                            case 'pdf':
                                $window.open('export/pdf', '_blank');
                                break;
                        }
                        $scope.showAlertExportOk = true;
                    } else {
                        $scope.showAletErrorExport = true;
                    }

                });
            };


            $scope.showCalenderized = function () {
                console.log("showCalenderized");
                $scope.showModalCalenderized = true;
            };

            //llama a directiva sendMail para mostrar modal
            $scope.callModal = function () {
                $rootScope.$broadcast('callModal');
                $scope.showModal = true;
            };

            /**
             * editar informacion del usuario
             * @param {type} userSelected
             * @returns {undefined}
             */
            $scope.editUser = function (userSelected) {
               
               $scope.dataModal = {};
               $scope.showSaveParameters = false;
               $scope.showErrorSaveParameters = false;
               successModalOperation = false;
               
               $scope.dataModal.userPassword = userSelected.password;
               $scope.dataModal.userId = userSelected.id;
               $scope.dataModal.userPhone = userSelected.phone;
               $scope.dataModal.userRealm = userSelected.realm;
               
               $scope.dataModal.userRut = userSelected.rut;
               $scope.dataModal.nameUser = userSelected.userName;
               $scope.dataModal.userLastName = userSelected.lastName;
               $scope.dataModal.userUserName = userSelected.name;
               $scope.dataModal.userEmail = userSelected.email;
               $scope.dataModal.userCompanyId = userSelected.companyId;
               // trae informacion del usuario en backoffice
                user.getByUsername({
                    'realm': realmBack,
                    'platform': userSelected.realm,
                    'username': userSelected.userName
                }, function (data) {
                    if (data.status && data.functionalityId) {
                        $scope.dataModal.funPackageId = data.functionalityId.toString();
                    }
                }, function (error) {
                    console.error(error);
                });
                $scope.showModalEditUser = true;
               
            };
            
            function dataToRequest(dataUpdateParameters) {
                var objUser = {};

                // Si el usuario escoge actualizar el paquete funcional (changeProfile)
                // se asigna en esta variable el perfil seleccionado del combo paquete funcional
                // se hace uso de programacion funcional a traves de los metodos filter y map
                if (dataUpdateParameters.changeProfile) {
                    var arrayProfileSel = $scope.functionalPackageList.filter(function (funPackArray) {
                        return funPackArray.id == dataUpdateParameters.funPackageId;
                    }).map(function (funPack) {
                        return funPack.profile;
                    })[0];
                    objUser['profileSel'] = JSON.stringify(arrayProfileSel);
                }

                objUser['id'] = dataUpdateParameters.userId;
                objUser['rut'] = dataUpdateParameters.userRut;
                objUser['userName'] = dataUpdateParameters.nameUser;
                objUser['password'] = dataUpdateParameters.userPassword;
                objUser['email'] = dataUpdateParameters.userEmail;
                objUser['name'] = dataUpdateParameters.userUserName;
                objUser['lastName'] = dataUpdateParameters.userLastName;
                objUser['phone'] = dataUpdateParameters.userPhone;
                objUser['realm'] = dataUpdateParameters.userRealm;
                objUser['companyId'] = dataUpdateParameters.userCompanyId;
                objUser['functionalityId'] = dataUpdateParameters.funPackageId;

                return objUser;

            }
           
           /**
            * realiza actualizacion del usuario
            * @returns {undefined}
            */
            function makeUpdateUser() {
                user.updateUserSelected({
                    'user': dataToRequest($scope.dataModal),
                    'realm': plataformSelected
                }, function (response) {
                    if (response.result) {
                        $scope.showSaveParameters = true;
                        $scope.showErrorSaveParameters = false;
                        successModalOperation = true;
                    } else {
                        $scope.showSaveParameters = false;
                        $scope.showErrorSaveParameters = true;
                        successModalOperation = false;
                    }
                }, function (error) {
                    $scope.showSaveParameters = false;
                    $scope.showErrorSaveParameters = true;
                    successModalOperation = false;
                });
            }
            
            $scope.updateUserFunction = function () {
                
                if ($scope.dataModal.changeProfile) {
                    // se actualiza paquete funcional y perfilamiento del usuario
                    SweetAlert.swal({
                        title: "Esta Seguro?",
                        text: "Se sobreescribiran los permisos del usuario seleccionado",
                        type: "info",
                        showCancelButton: true,
                        cancelButtonText: "Cancelar",
                        confirmButtonColor: "#5cc25a",
                        confirmButtonText: "Actualizar !",
                        closeOnConfirm: false,
                        closeOnCancel: true},
                            function (isConfirm) {
                                if (isConfirm) {
                                    makeUpdateUser();
                                    SweetAlert.swal({
                                        title: "",
                                        timer: 0.1,
                                        showConfirmButton: false
                                    });
                                }
                            });
                } else {
                    // solo se actualiza la informacion basica del usuario
                    makeUpdateUser();
                }
            };

            $scope.$watch('showModalEditUser', function () {
                // solo si fue exitosa la actualizacion, se realiza un refresh del grid
                if (successModalOperation) {
                    getUsersbyCompany();
                }
            }, true);
            
            
            /**
             * configuracion de perfiles y funcionalidades disponibles para el usuario
             * @param {type} user
             * @returns {undefined}
             */
            $scope.configProfileUser = function (userSelected) {

                userNameSelected = userSelected.userName;
                $scope.showModalProfileConfigUser = false;
                $scope.submenuClickOnMap = false;

                $scope.showSaveParameters = false;
                $scope.showErrorSaveParameters = false;
                
                user.getProfileByUsername({
                    'realm': plataformSelected,
                    'userName': userNameSelected
                }, function (response) {
                    if (response.hadProfile) {
                        $scope.profileModel = response;
                        $scope.showModalProfileConfigUser = true;
                        $scope.menuDataCollapse = [true, true, true, true, true, true, true, true];
                    } else {
                        $scope.showAletError = true;
                    }
                }, function (error) {
                    console.log("error get profiles");
                    $scope.showAletError = true;
                });
                
            };
            
            $scope.uncheckedSelectedChild = function (index) {
                angular.forEach($scope.profileModel.profiles[index - 1].childs, function (value, key) {
                    value.active = false;
                });
            };
            
            $scope.checkedAllChild = function (index) {
                angular.forEach($scope.profileModel.profiles[index - 1].childs, function (value, key) {
                    value.active = true;
                });
            };

            /**
             * Metodo para actualizar los permisos de un usuario sobre
             * las plataformas determinadas
             * 
             * @returns {undefined}
             */
            $scope.updateProfileUser = function () { 
                profileByUserModal = $scope.profileModel;
                profileByUserModal.userName = userNameSelected;
                profileByUserModal.plataform = plataformSelected;

                /**
                 * Confirmacion de la actualizacion
                 */
                SweetAlert.swal({
                    title: "Esta Seguro?",
                    text: "Se actualizara las funcionalidades del usuario seleccionado",
                    type: "info",
                    showCancelButton: true,
                    cancelButtonText: "Cancelar",
                    confirmButtonColor: "#5cc25a",
                    confirmButtonText: "Actualizar !",
                    closeOnConfirm: false,
                    closeOnCancel: true},
                        function (isConfirm) {
                            if (isConfirm) {
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
                                    console.log("error guardando perfil por usuario");
                                });
                                SweetAlert.swal({
                                    title: "",
                                    timer: 0.1,
                                    showConfirmButton: false
                                });
                            }
                        });
            };

            $scope.menuCollapseFn = function () {
                for (var i = 0; $scope.profileModel.profiles.length - 1; i += 1) {
                    $scope.menuDataCollapse.append('false');
                }
            };

            /**
             * metodo para identificar el renglon que se quiere colapsar o decolapsar en 
             * la edicion de perfiles y permisos por usuario
             * @param {type} index
             * @param {type} profileIndexId
             * @returns {undefined}
             */
            $scope.selectTableMenuRow = function (index, profileIndexId) {
                if ($scope.menuDataCollapse === 'undefined') {
                    $scope.menuDataCollapse = $scope.menuCollapseFn();
                } else {

                    if ($scope.tableRowExpanded === false && $scope.tableRowIndexCurrExpanded === "" && $scope.storeIdExpanded === "") {
                        $scope.tableRowIndexPrevExpanded = "";
                        $scope.tableRowExpanded = true;
                        $scope.tableRowIndexCurrExpanded = index;
                        $scope.storeIdExpanded = profileIndexId;
                        $scope.menuDataCollapse[index] = false;
                    } else if ($scope.tableRowExpanded === true) {
                        if ($scope.tableRowIndexCurrExpanded === index && $scope.storeIdExpanded === profileIndexId) {
                            $scope.tableRowExpanded = false;
                            $scope.tableRowIndexCurrExpanded = "";
                            $scope.storeIdExpanded = "";
                            $scope.menuDataCollapse[index] = true;
                        } else {
                            $scope.tableRowIndexPrevExpanded = $scope.tableRowIndexCurrExpanded;
                            $scope.tableRowIndexCurrExpanded = index;
                            $scope.storeIdExpanded = profileIndexId;
                            $scope.menuDataCollapse[$scope.tableRowIndexPrevExpanded] = true;
                            $scope.menuDataCollapse[$scope.tableRowIndexCurrExpanded] = false;
                        }
                    }
                }
            };
            
            $scope.insertRowUser = function () {
                
                usSpinnerService.spin('spinner-10');
                $scope.dataModalInsert.companyId = companySelected.id;
                user.insertNewUser({
                    'user': $scope.dataModalInsert,
                    'realm': plataformSelected
                }, function (response) {
                    if (response.result) {
                        $scope.showSaveParameters = true;
                        $scope.showErrorSaveParameters = false;
                        successModalOperation = true;
                    } else {
                        $scope.showSaveParameters = false;
                        $scope.showErrorSaveParameters = true;
                        successModalOperation = false;
                    }
                    usSpinnerService.stop('spinner-10');
                }, function (error) {
                    $scope.showSaveParameters = false;
                    $scope.showErrorSaveParameters = true;
                    successModalOperation = false;
                    console.log("error agregando usuario");
                    usSpinnerService.stop('spinner-10');
                });

            };
            
            // accion ocurrida al cerrar el modal de creacion de usuario
            $scope.$watch('showModalAddUser', function () {
                // solo si fue exitosa la actualizacion, se realiza un refresh del grid
                // y se resetea el objeto q almacena la informacion
                if (successModalOperation) {
                    $scope.dataModalInsert = {};
                    getUsersbyCompany();
                }
            }, true);

        });
