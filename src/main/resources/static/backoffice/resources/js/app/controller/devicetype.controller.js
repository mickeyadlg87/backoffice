'use strict';

angular.module('backOfficeNewapp')
        .controller('deviceTypeController', function ($timeout, $scope, $rootScope, $window, usSpinnerService, eventdevice, accesorydevice, exportXls, DTOptionsBuilder, DTColumnDefBuilder) {

            $timeout(function () {
                usSpinnerService.spin('spinner-4');
            }, 100);

            var arrayData;
            var realm = "rslite";

            var dataExport;
            var successModalOperation = false;

            var dataEventDeviceModal = {};
            $scope.dataModalInsert = {};

            $scope.realm = realm;
            $scope.showRequired = true;
            $scope.showModal = false;
            $scope.showModalCalenderized = false;
            $scope.showAletError = false;
            $scope.showAlertExportOk = false;
            $scope.showAletErrorExport = false;
            $scope.showSaveParameters = false;
            $scope.showErrorSaveParameters = false;
            // modal
            $scope.showModalEventByDevice = false;
            $scope.showModalAccesoryByDevice = false;
            $scope.typeReport = "tipodispositivo";

            console.log("$scope.realm ", $scope.realm);

            //se mostrara "filtro de reporte"
            $scope.filterReport = false;

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
                DTColumnDefBuilder.newColumnDef(3).notSortable() // Editar
            ];

            $scope.dtColumnDefsForEvent = [
                DTColumnDefBuilder.newColumnDef(0),
                DTColumnDefBuilder.newColumnDef(1),
                DTColumnDefBuilder.newColumnDef(2).notSortable(), // check
                DTColumnDefBuilder.newColumnDef(3).notSortable()  // check
            ];

            $scope.dtColumnDefsForAccesories = [
                DTColumnDefBuilder.newColumnDef(0),
                DTColumnDefBuilder.newColumnDef(1),
                DTColumnDefBuilder.newColumnDef(2),
                DTColumnDefBuilder.newColumnDef(3).notSortable() // check
            ];

            $timeout(function () {
                getDeviceTypesList();
            }, 200);
            
            function getDeviceTypesList() {

                var dataExportObj = {};
                var objDevType = {};
                var arrayDevType = new Array();

                dataExport = new Array();
                arrayData = new Array();

                $scope.reportShow = false;
                $rootScope.$broadcast('disableButtonSearch', true);
                $rootScope.$broadcast('disableButtonCreate', true);

                eventdevice.getAllDeviceType({
                    'realm': "backoffice",
                    'sortBy': null
                }, function (data) {
                    arrayData = data;
//                    console.log("arrayData:  ", arrayData[0]);
                    if (arrayData.length >= 1) {
                        angular.forEach(arrayData, function (valueDeviceType, key) {
                            objDevType['id'] = valueDeviceType.id;
                            objDevType['name'] = valueDeviceType.name;
                            objDevType['producer'] = valueDeviceType.producer;
                            objDevType['creationDate'] = valueDeviceType.creationDate;

                            /*** export to pdf - excel ***/
                            dataExportObj['Nombre'] = valueDeviceType.name;
                            dataExportObj['Fabricante'] = valueDeviceType.producer;
                            dataExportObj['Fecha de Creacion'] = new Date(valueDeviceType.creationDate).toLocaleDateString();

                            arrayDevType.push(objDevType);
                            dataExport.push(dataExportObj);

                            objDevType = {};
                            dataExportObj = {};
                        });
                        $scope.deviceTypeList = arrayDevType;
                        $scope.reportShow = true;
                    } else {
                        $scope.reportShow = false;
                        $scope.showAletError = true;
                    }
                    usSpinnerService.stop('spinner-4');
                    $rootScope.$broadcast('disableButtonSearch', false);
                    $rootScope.$broadcast('disableButtonCreate', false);
                }, function (error) {
                    usSpinnerService.stop('spinner-4');
                    console.log("error get device type list");
                    $scope.reportShow = false;
                    $rootScope.$broadcast('disableButtonSearch', false);
                    $rootScope.$broadcast('disableButtonCreate', false);
                    $scope.showAletError = true;
                });
            }

            function dataToRequest(dataUpdateParameters) {
                var objCompany = {};

                objCompany['id'] = dataUpdateParameters.companyId;
                objCompany['name'] = dataUpdateParameters.companyName;
                objCompany['businessName'] = dataUpdateParameters.companyBusinessName;
                objCompany['address'] = dataUpdateParameters.companyAddress;
                objCompany['rut'] = dataUpdateParameters.companyRut;
                objCompany['phone'] = dataUpdateParameters.companyPhone;
                objCompany['secondaryPhone'] = dataUpdateParameters.companySecondaryPhone;
                objCompany['maxVehicles'] = dataUpdateParameters.companyMaxVehicles;
                objCompany['email'] = dataUpdateParameters.companyEmail;
                objCompany['resellerId'] = dataUpdateParameters.companyResellerId;
                objCompany['planId'] = dataUpdateParameters.companyPlanId;
                objCompany['maxUsersPerCompany'] = dataUpdateParameters.companyMaxUsers;
                objCompany['weeklyReport'] = dataUpdateParameters.companyWeeklyReport;

                return objCompany;

            }

            $rootScope.$broadcast('disableButtonSearch', false);
            $rootScope.$broadcast('disableButtonCreate', true);
            $scope.alertsData = [{type: 'danger', msg: 'No hay datos disponible'}];
            $scope.alertsExport = [{type: 'danger', msg: 'Hubo problemas al exportar, por favor inténtelo nuevamente'}];
            $scope.alertsExportOk = [{type: 'success', msg: 'El reporte fue exportado exitosamente'}];
            $scope.alertSaveParameters = [{type: 'success', msg: 'Los parámetros han sido modificados correctamente'}];
            $scope.alertErrorSaveParameters = [{type: 'danger', msg: 'Ha ocurrido un error al intentar modificar los parámetros, favor volver a intentar'}];

            $scope.closeAlertError = function (index) {
                $scope.showAletError = false;
            };

            $scope.closeAlertSendEmail = function (index) {
                $scope.showAlertExportOk = false;
            };

            $scope.closeAlert = function (index) {
                $scope.showAletErrorExport = false;
            };

            $scope.closeAlertParameters = function (index) {
                $scope.showSaveParameters = false;
                $scope.showErrorSaveParameters = false;
            };

            $scope.$on('create', function (event, dataFiltered) {
                $scope.showModalAddClient = true;
                $scope.showSaveParameters = false;
                $scope.showErrorSaveParameters = false;
                successModalOperation = false;
            });

            //funcion que genera exportar reportes
            $scope.generateReport = function (type) {
                $scope.showAlertExportOk = false;
                $scope.showAletErrorExport = false;
                var objHeader = {};
                objHeader['Fecha Generacion'] = new Date().toLocaleString();

                exportXls.postExportXls({
                    'title': "Reporte de Tipo de Dispositivos Backoffice",
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
             * 
             * @param {type} devTypeSelected
             * @returns {undefined}
             */
            $scope.editAccesory = function (devTypeSelected) {

                var arrayAccesories = new Array();
                var arrayAccesoriesByDevice = new Array();
                var objAccesor = {};

                dataEventDeviceModal = {};
                dataEventDeviceModal.idDeviceType = devTypeSelected.id;

                $scope.showModalAccesoryByDevice = true;
//                $('#genericTitleModal').text("Accesorios para dispositivo: " + devTypeSelected.name);

                $scope.showSaveParameters = false;
                $scope.showErrorSaveParameters = false;
                $scope.reportAccesoryShow = false;

                accesorydevice.getEnableAccessoryByDevice({
                    'realm': "backoffice",
                    'deviceTypeId': devTypeSelected.id
                }, function (data) {
                    arrayAccesories = data;
                    if (arrayAccesories.length >= 1) {
                        angular.forEach(arrayAccesories, function (valueAccesorioByDevT, key) {
                            objAccesor['id'] = valueAccesorioByDevT.id;
                            objAccesor['accesoryName'] = valueAccesorioByDevT.accesoryName;
                            objAccesor['enable'] = valueAccesorioByDevT.enable;
                            objAccesor['accesoryProducer'] = valueAccesorioByDevT.accesoryProducer;
                            objAccesor['variable'] = valueAccesorioByDevT.variable;

                            arrayAccesoriesByDevice.push(objAccesor);
                            objAccesor = {};
                        });
                        $scope.accesoryDevTypeList = arrayAccesoriesByDevice;
                        $scope.reportAccesoryShow = true;
                    } else {
                        $scope.showAletError = true;
                    }

                }, function (error) {
                    console.log("error get accesories list");
                    $scope.showAletError = true;
                });

            };
            /**
             * editar informacion del tipo de dispositivo
             * @param {type} deviceTypeSelected
             * @returns {undefined}
             */
            $scope.editDeviceType = function (deviceTypeSelected) {

                var arrayEvents = new Array();
                var arrayEventsByDev = new Array();
                var objEvents = {};

                dataEventDeviceModal = {};
                dataEventDeviceModal.idDeviceType = deviceTypeSelected.id;

                $scope.showModalEventByDevice = true;
                $('#genericTitleModal').text("Eventos para dispositivo: " + deviceTypeSelected.name);

                $scope.showSaveParameters = false;
                $scope.showErrorSaveParameters = false;
                $scope.reportEventsShow = false;
                usSpinnerService.spin('spinner-5');

                eventdevice.getEnableEventsByDevice({
                    'realm': "backoffice",
                    'deviceTypeId': deviceTypeSelected.id,
                    'onlyVisibleEvents': true
                }, function (data) {
                    arrayEvents = data;
//                    console.log("arrayData:  ", arrayEvents);
                    if (arrayEvents.length >= 1) {
                        angular.forEach(arrayEvents, function (valueEventByDevT, key) {
                            objEvents['id'] = valueEventByDevT.id;
                            objEvents['eventName'] = valueEventByDevT.eventName;
                            objEvents['enablePlataform'] = valueEventByDevT.enablePlataform;
                            objEvents['enableCertificate'] = valueEventByDevT.enableCertificate;
                            objEvents['approvalDate'] = valueEventByDevT.approvalDate;

                            arrayEventsByDev.push(objEvents);
                            objEvents = {};
                        });
                        $scope.eventEnableDevTpList = arrayEventsByDev;
                        $scope.reportEventsShow = true;
                    } else {
                        $scope.showAletError = true;
                    }
                    usSpinnerService.stop('spinner-5');
                }, function (error) {
                    console.log("error get events list");
                    usSpinnerService.stop('spinner-5');
                    $scope.showAletError = true;
                });

            };

            // accion ocurrida al cerrar el modal de actualizacion de cliente
            $scope.$watch('showModalModifyClient', function () {
                // solo si fue exitosa la actualizacion, se realiza un refresh del grid
                if (successModalOperation) {
                    getDeviceTypesList();
                }
            }, true);

            // accion ocurrida al cerrar el modal de creacion de cliente
            $scope.$watch('showModalAddClient', function () {
                // solo si fue exitosa la actualizacion, se realiza un refresh del grid
                // y se resetea el objeto q almacena la informacion
                if (successModalOperation) {
                    $scope.dataModalInsert = {};
                    $scope.dataModalInsert.weeklyReport = true;
                    getDeviceTypesList();
                }
            }, true);

            $scope.updateAccesoriesForDevice = function () {
                usSpinnerService.spin('spinner-6');
                dataEventDeviceModal.accesoryForDevice = $scope.accesoryDevTypeList;
                dataEventDeviceModal.realm = "backoffice";
                accesorydevice.updateForDevice({
                    'content': dataEventDeviceModal
                }, function (response) {
                    if (response.result) {
                        $scope.showSaveParameters = true;
                        $scope.showErrorSaveParameters = false;
                    } else {
                        $scope.showSaveParameters = false;
                        $scope.showErrorSaveParameters = true;
                    }
                    usSpinnerService.stop('spinner-6');
                }, function (error) {
                    $scope.showSaveParameters = false;
                    $scope.showErrorSaveParameters = true;
                    console.log("error editando accesorios por dispositivo");
                    usSpinnerService.stop('spinner-6');
                });
            };

            $scope.updateEventsForDevice = function () {
                usSpinnerService.spin('spinner-5');
                dataEventDeviceModal.eventForDevice = $scope.eventEnableDevTpList;
                dataEventDeviceModal.realm = "backoffice";
                eventdevice.updateEventsForDev({
                    'content': dataEventDeviceModal
                }, function (response) {
                    if (response.result) {
                        $scope.showSaveParameters = true;
                        $scope.showErrorSaveParameters = false;
                    } else {
                        $scope.showSaveParameters = false;
                        $scope.showErrorSaveParameters = true;
                    }
                    usSpinnerService.stop('spinner-5');
                }, function (error) {
                    $scope.showSaveParameters = false;
                    $scope.showErrorSaveParameters = true;
                    console.log("error editando eventos por dispositivo");
                    usSpinnerService.stop('spinner-5');

                });
            };

        });
