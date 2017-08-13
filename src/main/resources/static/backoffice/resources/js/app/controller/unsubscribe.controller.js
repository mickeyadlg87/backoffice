'use strict';

angular.module('backOfficeNewapp')
        .controller('unsubscribeController', function ($scope, $timeout, SweetAlert, $localStorage, $rootScope, $window, usSpinnerService, unsubscribe, exportXls, DTOptionsBuilder, DTColumnDefBuilder) {

            var arrayData;
            var arrayStateReason;
            var arrayStateApplicant;
            var realm = "rslite";
            var realmBack = "backoffice";
            var dataExport;
            var plataformSelected;
            var limite;
            var off;
            var companySelected = {};

            $scope.realm = realm;
            $scope.showRequired = true;
            $scope.showModal = false;
            $scope.showAletError = false;
            $scope.showAlertExportOk = false;
            $scope.showAletErrorExport = false;
            $scope.darDeBajaSeleccionado = {};

            $scope.showModalProfileConfigUser = false;
            $scope.typeReport = "darDeBaja";

            // variables for profile edition (config)
            $scope.tableRowExpanded = false;
            $scope.tableRowIndexCurrExpanded = "";
            $scope.tableRowIndexPrevExpanded = "";
            $scope.storeIdExpanded = "";
            $scope.menuDataCollapse = [true, true, true];

            //se mostrara "filtro de reporte"
            $scope.filterReport = true;

            $scope.barNav = false;
            $scope.success = false;

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
                plataformSelected = data.plataform;
                companySelected = data.companySelected;
                limite = data.rangeSel ? JSON.parse(data.rangeSel).limit : undefined;
                off = data.rangeSel ? JSON.parse(data.rangeSel).offset : undefined;
                getUnitsByCompany();
            });
            
            getMotivosdeBaja();
            getSolicitantes();

            $scope.alertError = [{type: 'danger', msg: 'No hay datos disponibles'}];
            $scope.alertExportOk = [{type: 'success', msg: 'El reporte fue exportado exitosamente'}];
            $scope.alertExportError = [{type: 'danger', msg: 'Hubo problemas al exportar, por favor inténtelo nuevamente'}];

            $scope.closeAlertError = function (index) {
                $scope.showAletError = false;
                $scope.showAlertExportOk = false;
                $scope.showAletErrorExport = false;
            };
            
            function getMotivosdeBaja() {

                var objReason = {};
                var arraReason = new Array();

                unsubscribe.getGeneralState({
                    'realm': realmBack,
                    'codeName': 'UNSUSBRIBE_REASON'
                }, function (dta) {
                    arrayStateReason = dta;
                    if (arrayStateReason) {
                        angular.forEach(arrayStateReason, function (val, ky) {
                            objReason['reason'] = val.descriptionState;
                            arraReason.push(objReason);
                            objReason = {};
                        });
                    } else {
                        arraReason = [{reason: "Sin Datos"}];
                    }
                    $scope.motivoBajaGroup = arraReason;
                }, function (error) {
                    $scope.motivoBajaGroup = [{reason: "Sin Datos"}];
                    console.error(error);
                });
            }

            function getSolicitantes() {
                var objApplicant = {};
                var arrayApplicant = new Array();

                unsubscribe.getGeneralState({
                    'realm': realmBack,
                    'codeName': 'UNSUSCRIBE_APPLICANT'
                }, function (dto) {
                    arrayStateApplicant = dto;
                    if (arrayStateApplicant) {
                        angular.forEach(arrayStateApplicant, function (vl, ky) {
                            objApplicant['applicant'] = vl.descriptionState;
                            arrayApplicant.push(objApplicant);
                            objApplicant = {};
                        });
                    } else {
                        arrayApplicant = [{applicant: "Sin Datos"}];
                    }
                    $scope.solicitanteBajaGroup = arrayApplicant;
                }, function (error) {
                    $scope.solicitanteBajaGroup = [{applicant: "Sin Datos"}];
                    console.error(error);
                });

            }

            function getUnitsByCompany() {

                var dataExportObj = {};
                var objUnit = {};
                var arrayUnits = new Array();

                dataExport = new Array();
                arrayData = new Array();
                arrayStateReason = new Array();
                arrayStateApplicant = new Array();

                $scope.reportShow = false;
                usSpinnerService.spin('spinner-6');
                $rootScope.$broadcast('disableButtonSearch', true);
                $rootScope.$broadcast('disableButtonCreate', true);

                unsubscribe.getUnitsListForUnsubcribe({
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
                            objUnit['vehicleId'] = valueUnit.id;
                            objUnit['plateNumber'] = valueUnit.plateNumber;
                            objUnit['name'] = valueUnit.name;
                            objUnit['vin'] = valueUnit.vin;
                            objUnit['_m'] = valueUnit._m;
                            objUnit['simcard'] = valueUnit.simCardPhone;
                            objUnit['engineTypeName'] = valueUnit.engineTypeName;
                            objUnit['subVehicleTypeName'] = valueUnit.subVehicleTypeName;
                            objUnit['vehicleTypeName'] = valueUnit.vehicleTypeName;
                            objUnit['extraFields'] = valueUnit.extraFields;
                            objUnit['engineType'] = valueUnit.engineTypeId;
                            objUnit['subVehicleType'] = valueUnit.subVehicleTypeId;
                            objUnit['validateDate'] = valueUnit.validateDate;

                            /***** LastState *****/
                            objUnit['dateUnit'] = valueUnit.lastState._t == null ? "S/I" : valueUnit.lastState._t;

                            /*** export to pdf - excel ***/
                            dataExportObj['Compañia'] = valueUnit.companyName;
                            dataExportObj['Nombe'] = valueUnit.name;
                            dataExportObj['Vin'] = valueUnit.vin;
                            dataExportObj['Patente'] = valueUnit.plateNumber;
                            dataExportObj['Tipo Vehiculo'] = valueUnit.vehicleTypeName;
                            dataExportObj['Simcard'] = valueUnit.simCardPhone;
                            dataExportObj['Odometro'] = valueUnit.lastState.odometer == null ? "S/I" : valueUnit.lastState.odometer;
                            dataExportObj['Horometro'] = valueUnit.lastState.hourmeter == null ? "S/I" : valueUnit.lastState.hourmeter;

                            objUnit['unitSelected'] = false;

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

            //Funcion que permite seleccionar todo el arreglo desde un checkbox
//            $scope.checkAllRes = function (selectedRes, unidades) {
//                if (selectedRes) {
//                    angular.forEach(unidades, function (unidad) {
//                        unidad.unitSelected = true;
//                    });
//                } else {
//                    angular.forEach(unidades, function (unidad) {
//                        unidad.unitSelected = false;
//                    });
//                }
//                ;
//            };

            //funcion que genera exportar reportes
            $scope.generateReport = function (type) {

                $scope.showAlertExportOk = false;
                $scope.showAletErrorExport = false;
                var objHeader = {};
                objHeader['Fecha Generacion'] = new Date().toLocaleString();

                exportXls.postExportXls({
                    'title': "Reporte de unidades activas " + companySelected.name,
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

            $scope.unsubscribe = function () {
                $scope.showModalUnsusbcribe = true;
            };

            $scope.unsubscribeUnit = function () {
                $scope.showModalUnsusbcribe = false;
                var arrayUnitUnsuscribe = new Array();
                var arrayCheckSelected = $scope.unidades;
                var contUnit = 0;
                angular.forEach(arrayCheckSelected, function (val, ky) {
                    if (val.unitSelected == true) {
                        contUnit++;
                    }
                });
                SweetAlert.swal({
                    title: "Esta Seguro?",
                    text: "Seran dados de baja las " + contUnit + " unidades seleccionadas",
                    type: "info",
                    showCancelButton: true,
                    confirmButtonColor: "#5cc25a",
                    confirmButtonText: "Dar de Baja!",
                    cancelButtonColor: '#ee1313',
                    cancelButtonText: "Cancelar",
                    closeOnConfirm: false,
                    closeOnCancel: false
                }, function (isConfirm) {
                    if (isConfirm) {
                        $scope.barNav = true;
                        $scope.success = true;
                        var objCheck = {};
                        angular.forEach(arrayCheckSelected, function (val, ky) {
                            if (val.unitSelected == true) {
                                objCheck['name'] = val.name;
                                objCheck['plateNumber'] = val.plateNumber;
                                objCheck['vin'] = val.vin;
                                objCheck['subVehicleType'] = val.subVehicleType;
                                objCheck['engineType'] = val.engineType;
                                objCheck['companyId'] = val.idCompany;
                                objCheck['extraFields'] = val.extraFields;
                                objCheck['id'] = val.vehicleId;
                                objCheck['validate'] = 0;
                                objCheck['downDate'] = new Date().getTime() - $rootScope.offsetTimeZone;
                                objCheck['requestBy'] = "Baja solicitada por " + $localStorage.user + " | " + $scope.darDeBajaSeleccionado.motivo + " | " + $scope.darDeBajaSeleccionado.solicitante;
                                objCheck['validateDate'] = val.validateDate;
                                arrayUnitUnsuscribe.push(objCheck);
                                objCheck = {};
                            }
                        });
                        unsubscribe.updateUnsubcribeUnit({
                            'unidad': arrayUnitUnsuscribe,
                            'realm': realm
                        }, function (response) {
                            $scope.barNav = false;
                            $scope.success = false;
                            SweetAlert.swal({
                                title: "Listo!",
                                text: "Bajas Exitosas " + response.unidadOK + "  Fallidas " + response.unidadFail,
                                type: "success",
                                showCancelButton: false,
                                confirmButtonColor: "#5cc25a",
                                confirmButtonText: "Terminar"
                            }, function (isConfirm) {
                                if (isConfirm) {
                                    getUnitsByCompany();
                                }
                            });
                        }, function (error) {
                            console.error(error);
                        });
                    } else {
                        SweetAlert.swal('Cancelado!', 'Los dispositivos no fueron dados de baja', 'error');
                    }
                });
            };

        });