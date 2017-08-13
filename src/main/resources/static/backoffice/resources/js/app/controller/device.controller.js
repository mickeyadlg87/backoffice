'use strict';

angular.module('backOfficeNewapp')
        .controller('devController', function ($timeout, $scope, $rootScope, $http, $anchorScroll, $location, SweetAlert, $localStorage, $window, usSpinnerService, dispositivo, exportXls, DTOptionsBuilder, DTColumnDefBuilder) {

            $timeout(function () {
                usSpinnerService.spin('spinner-5');
            }, 100);

            var arrayData;
            var dataAccessories = {};
            var realm = "rslite";
            var realmBack = "backoffice";
            var newSeimcardMid;
            var accessoriesForCertificate = {};

            var dataExport;
            var successModalOperation = false;

            $scope.dataModal = {};
            $scope.dataModalSimcard = {};

            // Se obtienen los provedores de simcard de la BD
            $http.get("/backoffice/devices/getProviderSimcard?realm=" + realmBack).success(function (data, status) {
                $scope.providerGroup = data;
            }).error(function (data, status) {
                // Si no se pueden obtener se deja como opcion No Aplica
                $scope.providerGroup = [{name: 'NA', alias: 'NA', id: '1'}];
                console.error('Error occurred: ', data, status);
            });

            $scope.checkboxes = [];
            $scope.realm = realm;
            $scope.showModal = false;
            $scope.showAletError = false;
            $scope.showAlertExportOk = false;
            $scope.showAletErrorExport = false;
            $scope.showSaveParameters = false;
            $scope.showErrorSaveParameters = false;
            $scope.showAlertIccidNotFound = false;
            $scope.showAlertIccidOk = false;
            // modal
            $scope.showModalEventByDevice = false;
            $scope.showModalAccesoryByDevice = false;
            $scope.typeReport = "dispositivos";

            console.log("$scope.realm ", $scope.realm);

            //se mostrara "filtro de reporte"
            $scope.filterReport = false;

            //definicion de columnas para utilizar datatables de angular
            $scope.dtOptions = DTOptionsBuilder.newOptions()
                    .withOption('deferRender', true)
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
                DTColumnDefBuilder.newColumnDef(5),
                DTColumnDefBuilder.newColumnDef(6).notSortable() // Editar
            ];

            $timeout(function () {
                getDevices();
            }, 200);

            function getDevices() {

                var dataExportObj = {};
                var objdevice = {};
                var arrayDevice = new Array();
                dataExport = new Array();
                arrayData = new Array();

                $scope.reportShow = false;
                $rootScope.$broadcast('disableButtonSearch', true);
                $rootScope.$broadcast('disableButtonCreate', true);

                dispositivo.getDeviceList({
                    'realm': realm
                }, function (data) {
                    arrayData = data;
                    if (arrayData.length >= 1) {
                        angular.forEach(arrayData, function (valueDevice, key) {
                            objdevice['mid'] = valueDevice.mid;
                            objdevice['creationDate'] = valueDevice.creationDate;
                            objdevice['validationDate'] = valueDevice.validationDate;
                            objdevice['downDate'] = valueDevice.downDate;
                            objdevice['idDeviceType'] = valueDevice.idDeviceType;
                            objdevice['nameDeviceType'] = valueDevice.nameDeviceType;
                            objdevice['lastIp'] = valueDevice.lastIp;
                            objdevice['lastPort'] = valueDevice.lastPort;
                            objdevice['suspended'] = valueDevice.suspended;
                            objdevice['vehicleId'] = valueDevice.vehicleId;
                            objdevice['instalationDate'] = valueDevice.instalationDate;
                            objdevice['removalDate'] = valueDevice.removalDate;
                            objdevice['total'] = valueDevice.total;
                            objdevice['simcard'] = valueDevice.simcard;
                            dataExportObj['Imei'] = valueDevice.mid;
                            dataExportObj['Fecha Creacion'] = new Date(valueDevice.creationDate).toLocaleDateString();

                            if (valueDevice.creationDate == null || valueDevice.creationDate == 0) {
                                objdevice['fechaCreacion'] = null;
                            } else {
                                objdevice['fechaCreacion'] = new Date(valueDevice.creationDate).toLocaleDateString();
                            }

                            if (valueDevice.validationDate == null || valueDevice.validationDate == 0) {
                                objdevice['disabledCert'] = false;
                                objdevice['fechaValidacion'] = "S/I";
                                dataExportObj['Fecha Validacion'] = "S/I";
                            } else {
                                objdevice['disabledCert'] = true;
                                objdevice['fechaValidacion'] = valueDevice.validationDate;
                                dataExportObj['Fecha Validacion'] = new Date(valueDevice.validationDate).toLocaleDateString();
                            }

                            objdevice['fechaInstalacion'] = valueDevice.instalationDate == null ? "S/I" : valueDevice.instalationDate;

                            /** Simcard Parse **/
                            objdevice['phoneNumber'] = valueDevice.simcard.phoneNumber;
                            objdevice['providerId'] = valueDevice.simcard.provider;
                            objdevice['instalationDateSimCard'] = valueDevice.simcard.instalationDate;
                            objdevice['fechaInstalacionSimCard'] = new Date(valueDevice.simcard.instalationDate).toLocaleDateString();
                            objdevice['modemIdSimCard'] = valueDevice.simcard.mid;
                            objdevice['simcardId'] = valueDevice.simcard.id;

                            /*** export to pdf - excel ***/
                            if (valueDevice.simcard.instalationDate == null) {
                                dataExportObj['Fecha Instalacion'] = "S/I";
                            } else {
                                dataExportObj['Fecha Instalacion'] = new Date(valueDevice.simcard.instalationDate).toLocaleDateString();
                            }
                            if (valueDevice.simcard.phoneNumber == null) {
                                dataExportObj['Telefono'] = "S/I";
                            } else {
                                dataExportObj['Telefono'] = valueDevice.simcard.phoneNumber;
                            }

                            if (valueDevice.simcard.provider == null) {
                                dataExportObj['Proveedor'] = "S/I";
                            } else {
                                dataExportObj['Proveedor'] = valueDevice.simcard.provider;
                            }

                            arrayDevice.push(objdevice);
                            dataExport.push(dataExportObj);

                            objdevice = {};
                            dataExportObj = {};
                        });
                        $scope.devices = arrayDevice;
                        $scope.reportShow = true;
                    } else {
                        $scope.reportShow = false;
                        $scope.showAletError = true;
                    }
                    usSpinnerService.stop('spinner-5');
                    $rootScope.$broadcast('disableButtonSearch', false);
                    $rootScope.$broadcast('disableButtonCreate', false);
                }, function (error) {
                    usSpinnerService.stop('spinner-5');
                    console.log("error get devices");
                    $scope.reportShow = false;
                    $rootScope.$broadcast('disableButtonSearch', false);
                    $rootScope.$broadcast('disableButtonCreate', false);
                    $scope.showAletError = true;
                });
            }

            $scope.closeAlertError = function (index) {

                $scope.showModal = false;
                $scope.showAletError = false;
                $scope.showAlertExportOk = false;
                $scope.showAletErrorExport = false;
                $scope.showSaveParameters = false;
                $scope.showErrorSaveParameters = false;
                $scope.showAlertIccidNotFound = false;
                $scope.showAlertIccidOk = false;
                
            };

            //funcion que genera exportar reportes
            $scope.generateReport = function (type) {

                $scope.showAlertExportOk = false;
                $scope.showAletErrorExport = false;
                var objHeader = {};
                objHeader['Fecha Generacion'] = new Date().toLocaleString();

                exportXls.postExportXls({
                    'title': "Reporte de Dispositivos Backoffice",
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

            $rootScope.$broadcast('disableButtonSearch', false);
            $rootScope.$broadcast('disableButtonCreate', true);
            $scope.alertsData = [{type: 'danger', msg: 'No hay datos disponible'}];
            $scope.alertsExport = [{type: 'danger', msg: 'Hubo problemas al exportar, por favor inténtelo nuevamente'}];
            $scope.alertsSendEmail = [{type: 'success', msg: 'El reporte fue enviado por email'}];
            $scope.alertsExportOk = [{type: 'success', msg: 'El reporte fue exportado exitosamente'}];
            $scope.alertSaveParameters = [{type: 'success', msg: 'Los parámetros han sido modificados correctamente'}];
            $scope.alertErrorSaveParameters = [{type: 'danger', msg: 'Ha ocurrido un error al intentar modificar los parámetros, favor volver a intentar'}];
            $scope.alertErrorEditSimCard = [{type: 'danger', msg: 'El dispositivo selecionado no posee SimCard asociada, favor seleccionar otro dispositivo'}];
            $scope.alertsDataEvents = [{type: 'danger', msg: 'No se pudieron obtener los eventos para este dispositivo'}];
            $scope.alertsDataAccesories = [{type: 'warning', msg: 'No se pudieron obtener los accesorios para este dispositivo'}];
            $scope.alertsCertificateDeviceS = [{type: 'success', msg: 'Dispositivo Certificado Exitosamente!'}];
            $scope.alertsCertificateDeviceF = [{type: 'danger', msg: 'No se pudo certificar el dispositivo'}];
            $scope.alertsIccidNotExist = [{type: 'warning', msg: 'No se encuentra ICCID vinculado a este número'}];
            $scope.alertsIccidOk = [{type: 'success', msg: 'ICCID vinculado es : '}];

            //llama a directiva sendMail para mostrar modal
            $scope.callModal = function () {
                $rootScope.$broadcast('callModal');
                $scope.showModal = true;
            };

            /**
             * editar informacion de la SimCard
             * @param {type} simcard
             * @returns {undefined}
             */
            $scope.editSimcard = function (deviceSimcard) {
                $scope.dataModalSimcard = {};
                $scope.dataModalSimcardAdd = {};
                $scope.showSaveParameters = false;
                $scope.showErrorSaveParameters = false;
                $scope.showAlertIccidNotFound = false;
                $scope.showAlertIccidOk = false;
                successModalOperation = false;

                if (deviceSimcard.simcard.id) {
                    $scope.dataModalSimcard.simcardPhoneNumber = deviceSimcard.simcard.phoneNumber;
                    $scope.dataModalSimcard.simcardDateInstalation = new Date(deviceSimcard.simcard.instalationDate).toLocaleDateString();
                    $scope.dataModalSimcard.simcardDateInactivity = deviceSimcard.simcard.removalDate; //Desinstalado

                    //provider Select
                    $scope.dataModalSimcard.simcardProrvider = deviceSimcard.simcard.provider;

                    $scope.dataModalSimcard.simcardMID = deviceSimcard.simcard.mid;
                    $scope.dataModalSimcard.simcardID = deviceSimcard.simcard.id;
                    $scope.dataModalSimcard.simcardDateCreation = new Date(deviceSimcard.simcard.creationDate).toLocaleDateString();
                    $scope.dataModalSimcard.simcardRealm = deviceSimcard.simcard.realm;

                    $scope.dataModalSimcard.chek = false;

                    if (deviceSimcard.simcard.downDate !== null) {
                        $scope.dataModalSimcard.chek = true;
                        $scope.dataModalSimcard.simcardDatedown = new Date(deviceSimcard.simcard.downDate + $rootScope.offsetTimeZone);
                        $scope.downDateTrue = true;
                    }
                    if (deviceSimcard.simcard.downDate == null) {
                        $scope.downDateTrue = false;
                    }
                    $scope.showModalSimCard = true;
                } else {
                    $scope.dataModalSimcardAdd.simcardMidAdd = deviceSimcard.mid;
                    newSeimcardMid = deviceSimcard.mid;
                    $scope.dataModalSimcardAdd.simcardPhoneNumberAdd = deviceSimcard.simcard.phoneNumber;
                    $scope.dataModalSimcardAdd.simcardProrviderAdd = deviceSimcard.simcard.provider;
                    $scope.dataModalSimcardAdd.simcardDateInstalationAdd = new Date(deviceSimcard.simcard.instalationDate);
                    $scope.showModalSimCardAdd = true;
                }
            };

            /**
             * 
             * @returns {undefined}
             */
            $scope.changeState = function () {
                if ($scope.downDateTrue) {
                    $scope.downDateTrue = false;
                    $scope.dataModalSimcard.simcardDatedown = null;
                } else {
                    $scope.downDateTrue = true;
                }
            };

            /**
             * 
             * @param {type} dataUpdateParameters
             * @returns {dataToRequest.objSimCardDevice}
             * Update SimCard
             */
            function dataToRequest(dataUpdateParameters) {
                var objSimCardDevice = {};

                objSimCardDevice['id'] = dataUpdateParameters.simcardID;
                objSimCardDevice['realm'] = dataUpdateParameters.realm;
                objSimCardDevice['instalationDate'] = new Date(dataUpdateParameters.simcardDateInstalation).getTime();
                objSimCardDevice['phoneNumber'] = dataUpdateParameters.simcardPhoneNumber;
                objSimCardDevice['creationDate'] = new Date(dataUpdateParameters.simcardDateCreation).getTime();

                angular.forEach($scope.providerGroup, function (value, key) {
                    if (dataUpdateParameters.simcardProrvider == value.name) {
                        objSimCardDevice['providerId'] = value.id;
                    }
                });

                if (dataUpdateParameters.simcardDatedown !== null) {
                    objSimCardDevice['downDate'] = new Date(dataUpdateParameters.simcardDatedown).getTime();
                } else {
                    objSimCardDevice['downDate'] = null;
                }

                return objSimCardDevice;
            }

            $scope.updateSimCardFunction = function () {
                SweetAlert.swal({
                    title: "Esta Seguro?",
                    text: "La SimCard seleccionada sera actualizada ",
                    type: "info",
                    showCancelButton: true,
                    confirmButtonColor: "#5cc25a",
                    confirmButtonText: "Actualizar !",
                    cancelButtonColor: '#ee1313',
                    cancelButtonText: "Cancelar",
                    closeOnConfirm: false,
                    closeOnCancel: false
                }, function (isConfirm) {
                    if (isConfirm) {
                        dispositivo.updateSimCardDevice({
                            'dispositivo': dataToRequest($scope.dataModalSimcard),
                            'realm': realm
                        }, function (response) {
                            if (response.result) {
                                $scope.showSaveParameters = true;
                                $scope.showErrorSaveParameters = false;
                                SweetAlert.swal({
                                    title: "Listo!",
                                    text: "SimCard Actualizada",
                                    type: "success",
                                    showCancelButton: false,
                                    confirmButtonColor: "#5cc25a",
                                    confirmButtonText: "Terminar"
                                }, function (isConfirm) {
                                    if (isConfirm) {
                                        successModalOperation = true;
                                        $scope.showModalSimCard = false;
                                    }
                                });
                            } else {
                                $scope.showSaveParameters = false;
                                $scope.showErrorSaveParameters = true;
                                successModalOperation = false;
                            }
                        }, function (error) {
                            console.error(error);
                            $scope.showSaveParameters = false;
                            $scope.showErrorSaveParameters = true;
                            successModalOperation = false;
                            usSpinnerService.stop('spinner-5');
                        });
                    } else {
                        SweetAlert.swal('Cancelado!', 'La SimCard seleccionada no fue actualizada', 'error');
                    }
                });
            };

            function dataToRequestAdd(dataUpdateParametersAdd) {
                var objSimCardDeviceAdd = {};

                objSimCardDeviceAdd['realm'] = dataUpdateParametersAdd.realm;
                objSimCardDeviceAdd['mid'] = dataUpdateParametersAdd.simcardMidAdd;
                objSimCardDeviceAdd['instalationDate'] = new Date(dataUpdateParametersAdd.simcardDateInstalationAdd).getTime();
                objSimCardDeviceAdd['phoneNumber'] = dataUpdateParametersAdd.simcardPhoneNumberAdd;
                angular.forEach($scope.providerGroup, function (value, key) {
                    if (dataUpdateParametersAdd.simcardProrviderAdd == value.name) {
                        objSimCardDeviceAdd['providerId'] = value.id;
                    }
                });

                return objSimCardDeviceAdd;
            }

            $scope.addSimCardFunction = function () {
                SweetAlert.swal({
                    title: "Esta Seguro?",
                    text: "Se agregara una nueva SimCard al siguiente dispositivo " + newSeimcardMid,
                    type: "info",
                    showCancelButton: true,
                    confirmButtonColor: "#5cc25a",
                    confirmButtonText: "Agregar !",
                    cancelButtonColor: '#ee1313',
                    cancelButtonText: "Cancelar",
                    closeOnConfirm: false,
                    closeOnCancel: false
                }, function (isConfirm) {
                    if (isConfirm) {
                        dispositivo.insertNewSimCardForDevice({
                            'dispositivo': dataToRequestAdd($scope.dataModalSimcardAdd),
                            'realm': realm
                        }, function (response) {
                            if (response.result) {
                                $scope.showSaveParameters = true;
                                $scope.showErrorSaveParameters = false;
                                SweetAlert.swal({
                                    title: "Listo!",
                                    text: "SimCard agregada",
                                    type: "success",
                                    showCancelButton: false,
                                    confirmButtonColor: "#5cc25a",
                                    confirmButtonText: "Finalizar"
                                }, function (isConfirm) {
                                    if (isConfirm) {
                                        successModalOperation = true;
                                        $scope.showModalSimCardAdd = false;
                                    }
                                });
                            } else {
                                $scope.showSaveParameters = false;
                                $scope.showErrorSaveParameters = true;
                                successModalOperation = false;
                            }

                        }, function (error) {
                            console.error(error);
                            $scope.showSaveParameters = false;
                            $scope.showErrorSaveParameters = true;
                            successModalOperation = false;
                        });
                    } else {
                        SweetAlert.swal('Cancelado!', 'La SimCard no fue agregada', 'error');
                    }
                });
            };

            /**
             * editar informacion del dispositivo
             * @param {type} device
             * @returns {undefined}
             */
            $scope.editDevice = function (device) {

                $scope.dataModal = {};
                $scope.showSaveParameters = false;
                $scope.showErrorSaveParameters = false;
                successModalOperation = false;
                var accessories = {};

                $scope.dataModal.deviceImei = device.mid;
                $scope.dataModal.deviceSuspended = device.suspended;
                $scope.dataModal.deviceIdDeviceType = device.idDeviceType;
                $scope.dataModal.deviceName = device.nameDeviceType;
                $scope.dataModal.deviceCreationDate = new Date(device.creationDate + $rootScope.offsetTimeZone);
                $scope.dataModal.deviceLastIp = device.lastIp;
                $scope.dataModal.deviceLastPort = device.lastPort;

                if (device.validationDate == 0 || device.validationDate == null) {
                    $scope.dataModal.certifite = "Dispositivo Por Certificar";
                    $scope.dataModal.deviceValidationDate = null;
                } else {
                    $scope.dataModal.certifite = "Dispositivo Certificado";
                    $scope.dataModal.deviceValidationDate = new Date(device.validationDate + $rootScope.offsetTimeZone);
                }

                if (device.downDate == 0 || device.downDate == null) {
                    $scope.dataModal.deviceDownDate = null;
                } else {
                    $scope.dataModal.deviceDownDate = new Date(device.downDate + $rootScope.offsetTimeZone);
                }

                dispositivo.getAccessoriesInstalled({
                    'realm': realmBack,
                    'imei': $scope.dataModal.deviceImei
                }, function (response) {
                    if (response.status) {
                        dataAccessories = response;
                        if (dataAccessories) {
                            accessories = dataAccessories;
                        }
                        $scope.accessoriesDataUsername = accessories.username;
                        $scope.accessoriesDataValidationDate = accessories.validationDate == null ? "S/I" : new Date(accessories.validationDate).toLocaleDateString();
                        $scope.accessoriesDataInstalled = accessories.installedAccesory;
                        $scope.stringData = '';
                        if (accessories.installedAccesory != null) {
                            $scope.accessoriesDataInstalled.map(function (obj, index) {
                                if (index === ($scope.accessoriesDataInstalled.length - 1)) {
                                    $scope.stringData = $scope.stringData + obj.accesoryName;
                                } else {
                                    $scope.stringData = $scope.stringData + obj.accesoryName + ', ';
                                }
                            });
                        }


                    } else {
                        $scope.showAletError = true;
                    }
                }, function (error) {
                    console.log("error get accessories for device");
                    $scope.showAletErrorEvents = true;
                });

                $scope.showModalEditDevice = true;
            };

            function dataToRequestDevice(dataUpdateParametersDevice) {
                var objDevice = {};

                objDevice['mid'] = dataUpdateParametersDevice.deviceImei;
                objDevice['validationDate'] = new Date(dataUpdateParametersDevice.deviceValidationDate).getTime();
                objDevice['downDate'] = new Date(dataUpdateParametersDevice.deviceDownDate).getTime();
                objDevice['suspended'] = dataUpdateParametersDevice.deviceSuspended;
                objDevice['idDeviceType'] = dataUpdateParametersDevice.deviceIdDeviceType;
                objDevice['lastIp'] = dataUpdateParametersDevice.deviceLastIp;
                objDevice['lastPort'] = dataUpdateParametersDevice.deviceLastPort;

                return objDevice;
            }

            $scope.updateDeviceFunction = function () {
                usSpinnerService.spin('spinner-5');
                dispositivo.updateDeviceSelected({
                    'dispositivo': dataToRequestDevice($scope.dataModal),
                    'realm': realm
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
                    usSpinnerService.stop('spinner-5');
                }, function (error) {
                    $scope.showSaveParameters = false;
                    $scope.showErrorSaveParameters = true;
                    successModalOperation = false;
                    usSpinnerService.stop('spinner-5');
                });
            };

            $scope.$watch('showModalEditDevice', function () {
                // solo si fue exitosa la actualizacion, se realiza un refresh del grid
                if (successModalOperation) {
                    $timeout(function () {
                        usSpinnerService.spin('spinner-5');
                    }, 50);
                    $timeout(function () {
                        getDevices();
                    }, 100);
                }
            }, true);

            $scope.$watch('showModalSimCardAdd', function () {
                // solo si fue exitosa la actualizacion, se realiza un refresh del grid
                if (successModalOperation) {
                    $timeout(function () {
                        usSpinnerService.spin('spinner-5');
                    }, 50);
                    $timeout(function () {
                        getDevices();
                    }, 100);
                }
            }, true);


            $scope.$watch('showModalSimCard', function () {
                // solo si fue exitosa la actualizacion, se realiza un refresh del grid
                if (successModalOperation) {
                    $timeout(function () {
                        usSpinnerService.spin('spinner-5');
                    }, 50);
                    $timeout(function () {
                        getDevices();
                    }, 100);
                }
            }, true);

            /**
             * Modal Certificar dispositivo
             * @param {type} device
             * @returns {undefined}
             */
            $scope.certDevice = function (deviceEvent) {
                $scope.dataModalCert = {};
                $scope.showSaveParameters = false;
                $scope.showAletErrorEvents = false;
                $scope.showAletErrorAccessories = false;
                $scope.eventCert = new Array();
                $scope.accessoriesCert = new Array();
                $scope.hasCertificateEvents = false;
                $scope.eventCertTrue = true;

                successModalOperation = false;
                // debe ingresar datos de simcard antes de certificar
                if (!deviceEvent.simcard.id) {
                    SweetAlert.swal("Sin datos de Simcard!", "Ingrese info de Simcard primero", "info");
                    return;
                }

                var objdevice = {};
                var arrayDevice = new Array();
                var arraDeviceAcceossories = new Array();
                arrayData = new Array();

                $scope.dataModalCert.deviceName = deviceEvent.nameDeviceType;
                $scope.dataModalCert.deviceImei = deviceEvent.mid;
                $scope.dataModalCert.deviceSuspended = deviceEvent.suspended;
                $scope.dataModalCert.deviceIdDeviceType = deviceEvent.idDeviceType;
                $scope.dataModalCert.deviceCreationDate = deviceEvent.creationDate;
                $scope.dataModalCert.deviceLastIp = deviceEvent.lastIp;
                $scope.dataModalCert.deviceLastPort = deviceEvent.lastPort;
                $scope.dataModalCert.deviceValidationDate = deviceEvent.validationDate;
                $scope.dataModalCert.deviceDownDate = deviceEvent.downDate;

                var deviceIdType = deviceEvent.idDeviceType;

                dispositivo.getEventsForValidate({
                    'realm': realmBack,
                    'deviceTypeId': deviceIdType
                }, function (data) {
                    arrayData = data;
                    if (arrayData.length >= 1) {
                        $scope.hasCertificateEvents = true;
                        angular.forEach(arrayData, function (valueDevice, key) {
                            objdevice['eventId'] = valueDevice.eventId;
                            objdevice['eventName'] = valueDevice.eventName;
                            objdevice['enabled'] = false;
                            objdevice['validation'] = "";

                            arrayDevice.push(objdevice);
                            objdevice = {};
                        });
                        $scope.eventCert = arrayDevice;
                    } else {
                        $scope.showAletErrorEvents = true;
                    }
                }, function (error) {
                    console.log("error get certificate events for device");
                    $scope.showAletErrorEvents = true;
                });

                dispositivo.getAccessoriesForValidate({
                    'realm': realmBack,
                    'deviceTypeId': deviceIdType
                }, function (data) {
                    arrayData = data;
                    if (arrayData.length >= 1) {
                        angular.forEach(arrayData, function (valueAccessories, key) {
                            objdevice['accesoryId'] = valueAccessories.accesoryId;
                            objdevice['accesoryName'] = valueAccessories.accesoryName;
                            objdevice['accesorySelected'] = false;

                            arraDeviceAcceossories.push(objdevice);

                            objdevice = {};
                        });
                        $scope.accessoriesCert = arraDeviceAcceossories;
                    } else {
                        $scope.showAletErrorAccessories = true;
                    }
                    usSpinnerService.stop('spinner-5');
                }, function (error) {
                    usSpinnerService.stop('spinner-5');
                    console.log("error get accessories");
                    $scope.showAletErrorAccessories = true;
                });

                $scope.showModalCertDevice = true;
            };


            function insertValidationDateCert(insertParametersForCertificate) {
                var objDevice = {};

                objDevice['mid'] = insertParametersForCertificate.deviceImei;
                objDevice['validationDate'] = new Date().getTime();
                objDevice['downDate'] = null;
                objDevice['suspended'] = insertParametersForCertificate.deviceSuspended;
                objDevice['idDeviceType'] = insertParametersForCertificate.deviceIdDeviceType;
                objDevice['lastIp'] = insertParametersForCertificate.deviceLastIp;
                objDevice['lastPort'] = insertParametersForCertificate.deviceLastPort;

                return objDevice;
            }


            $scope.insertValidationDateForCertificate = function () {

                /**
                 * Valida accesorios seleccionados 
                 * @param {type} device
                 * @returns {undefined}
                 */
                var arrayAccessorySelected = $scope.accessoriesCert;
                var arrayAccessoryTrue = new Array();
                var objAccessory = {};
                angular.forEach(arrayAccessorySelected, function (val, ky) {
                    if (val.accesorySelected == true) {
                        objAccessory['accesoryId'] = val.accesoryId;
                        objAccessory['accesoryName'] = val.accesoryName;

                        arrayAccessoryTrue.push(objAccessory);
                        objAccessory = {};
                    }
                    ;
                });

                accessoriesForCertificate.installedAccesory = arrayAccessoryTrue;
                accessoriesForCertificate.imei = $scope.dataModalCert.deviceImei;
                accessoriesForCertificate.username = $localStorage.user;
                accessoriesForCertificate.validationDate = new Date().getTime();

                SweetAlert.swal({
                    title: "Esta Seguro?",
                    text: "Este Dispositivo sera Certificado",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#5cc25a",
                    confirmButtonText: "Certificar !",
                    cancelButtonColor: '#ee1313',
                    cancelButtonText: "Cancelar",
                    closeOnConfirm: false,
                    closeOnCancel: false
                },
                        function (isConfirm) {
                            if (isConfirm) {
                                dispositivo.updateDeviceSelected({
                                    'dispositivo': insertValidationDateCert($scope.dataModalCert),
                                    'realm': realm
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
                                    usSpinnerService.stop('spinner-5');
                                }, function (error) {
                                    $scope.showSaveParameters = false;
                                    $scope.showErrorSaveParameters = true;
                                    successModalOperation = false;
                                    usSpinnerService.stop('spinner-5');
                                });

                                dispositivo.saveAccessoriesForDevice({
                                    'dispositivo': accessoriesForCertificate,
                                    'realm': realmBack
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
                                    usSpinnerService.stop('spinner-5');
                                }, function (error) {
                                    $scope.showSaveParameters = false;
                                    $scope.showErrorSaveParameters = true;
                                    successModalOperation = false;
                                    usSpinnerService.stop('spinner-5');
                                });
                                SweetAlert.swal("Dispositivo Certificado!", "El dispositivo esta certificado Correctamente !", "success");
                            } else {
                                SweetAlert.swal("Cancelado", "El dispositivo no se certifico !", "error");
                            }
                            ;
                        });

            };

            /**
             * Validar Eventos dispositivo
             * @param {type} device
             * @returns {undefined}
             */
            $scope.validateEvent = function () {
                
                if ($location.hash() !== "evCerticated") {
                    // set the $location.hash to `evCerticated` and
                    // $anchorScroll will automatically scroll to it
                    $location.hash("evCerticated");
                } else {
                    // call $anchorScroll() explicitly,
                    // since $location.hash hasn't changed
                    $anchorScroll();
                }

                var eventForSearchInHistory = {};
                var arrayEventCert = $scope.eventCert;
                eventForSearchInHistory.arrayEvent = $scope.eventCert;
                eventForSearchInHistory.mid = $scope.dataModalCert;

                dispositivo.validateEvents({
                    'contentCertEvent': eventForSearchInHistory
                }, function (response) {
                    if (response.result) {
                        angular.forEach(arrayEventCert, function (value, key) {
                            value.enabled = true;
                            $scope.eventCertTrue = false;
                            value.validation = "Evento Validado Correctamente";
                        });
                    } else {
                        angular.forEach(arrayEventCert, function (value2, key2) {
                            var eventToCertificated = value2.eventId;
                            if (response.arrayEventFounded != 0) {
                                angular.forEach(response.arrayEventFounded, function (value1, key1) {
                                    var foundedEventIdResponse = value1.foundedEventId;
                                    if (eventToCertificated == foundedEventIdResponse) {
                                        value2.enabled = true;
                                        $scope.eventCertTrue = true;
                                        value2.validation = "Evento Validado Correctamente";
                                    } else {
                                        value2.enabled = false;
                                        $scope.eventCertTrue = true;
                                        value2.validation = "Evento No Validado";
                                    }
                                    ;
                                });
                            } else {
                                value2.enabled = false;
                                $scope.eventCertTrue = true;
                                value2.validation = "Evento No Validado";
                            }
                            ;
                        });
                    }
                }, function (error) {
                    $scope.showAletErrorEvents = true;
                    console.log("error validate Events");
                });
                $scope.eventCert = arrayEventCert;

            };

            $scope.$watch('showModalCertDevice', function () {
                // solo si fue exitosa la actualizacion, se realiza un refresh del grid
                if (successModalOperation) {
                    $timeout(function () {
                        usSpinnerService.spin('spinner-5');
                    }, 50);
                    $timeout(function () {
                        getDevices();
                    }, 100);
                }
            }, true);

            /**
             * valida que el iccid ingresado tenga un numero telefonico asociado
             * @param {type} iccidcode
             * @returns {undefined}
             */
            $scope.checkIccid = function (iccidcode) {
                usSpinnerService.spin('spinner-3');
                $http.post("/backoffice/simcard/getSim?realm=" + realmBack, {'type': 'ICCID', 'value': iccidcode})
                        .success(function (data, status) {
                            // la sim card no puede estar de baja
                            if (data.result && data.downDate == null) {
                                $scope.dataModalSimcardAdd.simcardPhoneNumberAdd = data.phoneNumber;
                            }else{
                                $scope.dataModalSimcardAdd.simcardPhoneNumberAdd = 'ICCID Invalido';     
                            }
                            usSpinnerService.stop('spinner-3');
                        }).error(function (data, status) {
                            $scope.dataModalSimcardAdd.simcardPhoneNumberAdd = 'ICCID Invalido';
                            usSpinnerService.stop('spinner-3');
                            console.error(data, status);
                        });
            };
            
            $scope.checkSimcardEditNumber = function (simNumber) {
                usSpinnerService.spin('spinner-3');
                $scope.showAlertIccidNotFound = false;
                $scope.showAlertIccidOk = false;
                $http.post("/backoffice/simcard/getSim?realm=" + realmBack, {'type': 'NUMBER', 'value': simNumber})
                        .success(function (data, status) {
                            // la sim card no puede estar de baja
                            if (data.result && data.downDate == null) {
                                $scope.iccidFound = data.iccid;
                                $scope.showAlertIccidOk = true;
                            } else {
                                $scope.showAlertIccidNotFound = true;
                            }
                            usSpinnerService.stop('spinner-3');
                        }).error(function (data, status) {
                            $scope.showAlertIccidNotFound = true;
                            usSpinnerService.stop('spinner-3');
                            console.error(data, status);
                        });
            };

        });