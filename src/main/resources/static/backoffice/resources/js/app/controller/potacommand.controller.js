'use strict';

angular.module('backOfficeNewapp')
        .controller('potacommandController', function ($scope, $timeout, SweetAlert, $localStorage, $rootScope, $window, usSpinnerService, unidad, potacommand, exportXls, DTOptionsBuilder, DTColumnDefBuilder) {

            var arrayData;
            var realm = "rslite";

            var dataExport;
            var plataformSelected;
            var limite;
            var off;
            var companySelected = {};
            $scope.dataModalValue = {};
            $scope.horoSelected = {};
            $scope.odoSelected = {};

            $scope.realm = realm;
            $scope.showAletError = false;
            $scope.showAletErrorGet = false;
            $scope.showAletErrorList = false;
            $scope.showAletErrorSend = false;
            $scope.showAletErrorSendError = false;
            $scope.showAletSendTrue = false;
            $scope.showAlertSearchingPota = false;
            $scope.typeReport = "unidades";
            $scope.showCommand = false;
            $scope.showCommandHor = false;
            $scope.showCommandOdo = false;
            $scope.senMessage = false;
            $scope.disabledButton = true;

            // variables for profile edition (config)
            $scope.tableRowExpanded = false;
            $scope.tableRowIndexCurrExpanded = "";
            $scope.tableRowIndexPrevExpanded = "";
            $scope.storeIdExpanded = "";
            $scope.menuDataCollapse = [true, true, true];

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
                DTColumnDefBuilder.newColumnDef(5),
                DTColumnDefBuilder.newColumnDef(6).notSortable() // Editar
            ];

            $scope.dtColumnDefsForHistoryPota = [
                DTColumnDefBuilder.newColumnDef(0),
                DTColumnDefBuilder.newColumnDef(1),
                DTColumnDefBuilder.newColumnDef(2),
                DTColumnDefBuilder.newColumnDef(3)
            ];


            //Funcion principal que recibe informacion para llamar servicio y generar reportes
            $scope.$on('search', function (event, data, rangeDate) {
                $scope.showAletError = false;
                plataformSelected = data.plataform;
                companySelected = data.companySelected;
                
                limite = data.rangeSel ? JSON.parse(data.rangeSel).limit : undefined;
                off = data.rangeSel ? JSON.parse(data.rangeSel).offset : undefined;

                getUnitsByCompany();
            });

            function getUnitsByCompany() {

                var dataExportObj = {};
                var objUnit = {};
                var arrayUnits = new Array();

                dataExport = new Array();
                arrayData = new Array();

                $scope.reportShow = false;
                usSpinnerService.spin('spinner-6');
                $rootScope.$broadcast('disableButtonSearch', true);
                $rootScope.$broadcast('disableButtonCreate', true);

                unidad.getUnitsList({
                    'realm': plataformSelected,
                    'companyId': companySelected.id,
                    'limit': limite,
                    'offset': off
                }, function (data) {
                    arrayData = data;
                    if (arrayData.length >= 1) {
                        angular.forEach(arrayData, function (valueUnit, key) {
                            objUnit['company'] = valueUnit.companyName;
                            objUnit['idCompany'] = valueUnit.idCompany;
                            objUnit['deviceTypeName'] = valueUnit.deviceTypeName;
                            objUnit['deviceTypeId'] = valueUnit.deviceTypeId;
                            objUnit['vehicleId'] = valueUnit.id;
                            objUnit['plateNumber'] = valueUnit.plateNumber;
                            objUnit['name'] = valueUnit.name;
                            objUnit['_m'] = valueUnit._m;
                            objUnit['simcard'] = valueUnit.simCardPhone;
                            objUnit['dateUnit'] = valueUnit.lastState.date;

                            arrayUnits.push(objUnit);
                            dataExport.push(dataExportObj);

                            objUnit = {};
                            dataExportObj = {};
                        });
                        $scope.unidades = arrayUnits;
                        $scope.reportShow = true;
                    } else {
                        $scope.reportShow = false;
                        $scope.showAletError = true;
                    }
                    usSpinnerService.stop('spinner-6');
                    $rootScope.$broadcast('disableButtonSearch', false);
                    $rootScope.$broadcast('disableButtonCreate', true);
                }, function (error) {
                    usSpinnerService.stop('spinner-6');
                    console.log("error get units");
                    $scope.reportShow = false;
                    $rootScope.$broadcast('disableButtonSearch', false);
                    $rootScope.$broadcast('disableButtonCreate', true);
                    $scope.showAletError = true;
                });
            }

            $scope.alertsData = [{type: 'danger', msg: 'No hay datos disponible'}];
            $scope.alertsDataGet = [{type: 'danger', msg: 'No se pudo obtener el comando seleccionado para este tipo de dispositivo'}];
            $scope.alertsDataList = [{type: 'danger', msg: 'No hay comandos para seleccionar, vuelva a intentar'}];
            $scope.alertsDataSend = [{type: 'danger', msg: 'No se pudo enviar el comando, vuelva a intentar'}];
            $scope.alertsCommandSentSearch = [{type: 'danger', msg: 'No existen comandos disponibles'}];
            $scope.alertsDataSendError = [{type: 'danger', msg: 'El servicio no se encuentra disponible, vuelva a intentar mas tarde'}];
            $scope.alertsDataSendTrue = [{type: 'success', msg: 'El comando fue encolado exitosamente, su número de petición es: '}];

            $scope.closeAlertError = function (index) {
                $scope.showAletError = false;
                $scope.showAletErrorGet = false;
                $scope.showAletErrorList = false;
                $scope.showAletErrorSend = false;
                $scope.showAletErrorSendError = false;
                $scope.showAletSendTrue = false;
                $scope.showAlertSearchingPota = false;
            };

            $scope.sendCommand = function (unitValue) {
                $scope.showAletErrorSend = false;
                $scope.showAletErrorSendError = false;
                $scope.showAletSendTrue = false;
                $scope.showAletErrorGet = false;
                $scope.dataModalCommand = {};
                $scope.dataSelected = {};
                $scope.showCommand = false;

                $scope.dataModalCommand.name = unitValue.deviceTypeName;
                $scope.dataModalCommand.id = unitValue.deviceTypeId;
                $scope.dataModalCommand.imei = unitValue._m;
                listCommandForSend();

                $scope.showModalCommand = true;
            };


            $scope.searchSentCommand = function (unitSelected) {

                var arrayPota = new Array();
                $scope.showAlertSearchingPota = false;
                $scope.showModalStatePotaByImei = true;
                $('#genericTitleModal').text("Estado Comandos Enviados al dispositivo: " + unitSelected._m);

                $scope.reportPotaShow = false;

                potacommand.getListHistoryPota({
                    'realm': "backoffice",
                    'modemId': unitSelected._m
                }, function (data) {
                    arrayPota = data;
                    if (arrayPota.length > 0) {
                        $scope.historyPotaList = arrayPota;
                        $scope.reportPotaShow = true;
                    } else {
                        $scope.showAlertSearchingPota = true;
                    }

                }, function (error) {
                    $scope.showAlertSearchingPota = true;
                    console.error("error get historial comandos pota ", error);
                });

            };

            function listCommandForSend() {
                var arrayList = new Array();
                var objListCommand = {};
                var arrayCommand = new Array();
                $scope.senMessage = false;

                potacommand.getPotaTypes({
                    'realm': "backoffice"
                }, function (response) {
                    arrayList = response;
                    if (arrayList.length >= 1) {
                        angular.forEach(arrayList, function (value, key) {
                            objListCommand['commandType'] = value.commandType;
                            arrayCommand.push(objListCommand);
                            objListCommand = {};
                        });
                        $scope.listCommand = arrayCommand;
                    } else {
                        $scope.showAletErrorList = true;
                    }
                }, function (error) {
                    console.log("error get command");
                    $scope.showAletErrorList = true;
                });
            }

            $scope.getCommand = function () {
                $scope.senMessage = false;
                $scope.showCommand = false;
                $scope.showAletErrorGet = false;
                $scope.showAletSendTrue = false;
                $scope.showAletErrorSend = false;
                $scope.showAletErrorSendError = false;
                getCommandForSend();
            };

            function getCommandForSend() {
                potacommand.getPotaCommandByName({
                    'realm': "backoffice",
                    'deviceTypeId': $scope.dataModalCommand.id,
                    'codeType': $scope.dataModalValue.nameCommand
                }, function (response) {
                    if (response.status && response.command) {
                        $scope.commandObject = response;
                        if (response.id == 77) {
                            $scope.showCommand = true;
                            $scope.showCommandHor = true;
                        }
                        else if (response.id == 79){
                            $scope.showCommand = true;
                            $scope.showCommandOdo = true;
                        } else {
                            $scope.showCommand = true;
                        }
                        $scope.senMessage = true;
                        $scope.disabledButton = false;
                    } else {
                        $scope.showAletErrorGet = true;
                    }
                }, function (error) {
                    console.log("error get command");
                    $scope.showAletErrorGet = true;
                });
                $scope.showCommandHor = false;
                $scope.showCommandOdo = false;
            }

            $scope.sendPotaCommandForUnit = function () {
                usSpinnerService.spin('spinner-8');
                $scope.disabledButton = true;
                var objectPota = {};
                var nuevoHorometro;
                var nuevoOdometro;
                objectPota.mid = $scope.dataModalCommand.imei;
                objectPota.codeType = $scope.commandObject.id;
                objectPota.platform = "backoffice";
                $scope.dataForSend = objectPota;
                if ($scope.commandObject.id == 77) {
                    nuevoHorometro = $scope.horoSelected.hourSelected * 3600000;
                    objectPota.horometer = nuevoHorometro;
                    sendCommandWithFilter();
                } else if ($scope.commandObject.id == 79){
                    nuevoOdometro = $scope.odoSelected.kmSelected;
                    objectPota.odometer = nuevoOdometro;
                    sendCommandWithFilter();
                } else {
                    sendNormalCommand();
                }
            };

            function sendCommandWithFilter() {
                potacommand.sendPotaCommandWithFilter({
                    'contentpota': $scope.dataForSend
                }, function (respuesta) {
                    if (respuesta.result && respuesta.response == "ok") {
                        $scope.serialPota = respuesta.idPotaMsg;
                        $scope.showAletSendTrue = true;
                    } else if (respuesta.result && respuesta.response == "error") {
                        $scope.showAletErrorSend = true;
                    } else {
                        $scope.showAletErrorSendError = true;
                    }
                    usSpinnerService.stop('spinner-8');
                    $scope.dataModalValue = {};
                    $scope.disabledButton = false;
                }, function (error) {
                    console.log("error send command");
                    $scope.dataModalValue = {};
                    $scope.showAletErrorSendError = true;
                    usSpinnerService.stop('spinner-8');
                    $scope.disabledButton = false;
                });
            }

            function sendNormalCommand() {
                potacommand.sendPotaCommand({
                    'contentpota': $scope.dataForSend
                }, function (respuesta) {
                    if (respuesta.result && respuesta.response == "ok") {
                        $scope.serialPota = respuesta.idPotaMsg;
                        $scope.showAletSendTrue = true;
                    } else if (respuesta.result && respuesta.response == "error") {
                        $scope.showAletErrorSend = true;
                    } else {
                        $scope.showAletErrorSendError = true;
                    }
                    usSpinnerService.stop('spinner-8');
                    $scope.dataModalValue = {};
                    $scope.disabledButton = false;
                }, function (error) {
                    console.log("error send command");
                    $scope.dataModalValue = {};
                    $scope.showAletErrorSendError = true;
                    usSpinnerService.stop('spinner-8');
                    $scope.disabledButton = false;
                });
            }

        });

