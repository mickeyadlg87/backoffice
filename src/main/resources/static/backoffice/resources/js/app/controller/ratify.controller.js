'use strict';

angular.module('backOfficeNewapp')
        .controller('ratifyController', function ($scope, $timeout, ratify, SweetAlert, $localStorage, $rootScope, $window, usSpinnerService, unsubscribe, exportXls, DTOptionsBuilder, DTColumnDefBuilder) {

            var arrayData;
            var arrayStateReason;
            var arrayStateApplicant;
            var realm = "rslite";
            var dataExport;
            var plataformSelected;
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
                DTColumnDefBuilder.newColumnDef(5),
                DTColumnDefBuilder.newColumnDef(6).notSortable() // Editar
            ];

            //Funcion principal que recibe informacion para llamar servicio y generar reportes
            $scope.$on('search', function (event, data, rangeDate) {
                plataformSelected = data.plataform;
                companySelected = data.companySelected;
                getUnitsUnsuscribeByCompany();
            });

            $scope.alertError = [{type: 'danger', msg: 'No hay datos disponibles'}];
            $scope.alertExportOk = [{type: 'success', msg: 'El reporte fue exportado exitosamente'}];
            $scope.alertExportError = [{type: 'danger', msg: 'Hubo problemas al exportar, por favor inténtelo nuevamente'}];

            $scope.closeAlertError = function (index) {
                $scope.showAletError = false;
                $scope.showAlertExportOk = false;
                $scope.showAletErrorExport = false;
            };
            
            function getUnitsUnsuscribeByCompany() {

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

                ratify.getUnitsListForRatify({
                    'realm': plataformSelected,
                    'companyId': companySelected.id
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

                            /*** export to pdf - excel ***/
                            dataExportObj['Empresa'] = valueUnit.companyName;
                            dataExportObj['Nombre'] = valueUnit.name;
                            dataExportObj['Vin'] = valueUnit.vin;
                            dataExportObj['Patente'] = valueUnit.plateNumber;
                            dataExportObj['Tipo Vehiculo'] = valueUnit.vehicleTypeName;
                            dataExportObj['Simcard'] = valueUnit.simCardPhone;
                            dataExportObj['imei'] = valueUnit._m;

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
                    'title': "Reporte de unidades dadas de baja " + companySelected.name,
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

            $scope.ratifyUnit = function () {
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
                    text: "Reversar baja para las " + contUnit + " unidades seleccionadas",
                    type: "info",
                    showCancelButton: true,
                    confirmButtonColor: "#5cc25a",
                    confirmButtonText: "Reversar!",
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
                                objCheck['validate'] = 1;
                                objCheck['downDate'] = null;
                                objCheck['requestBy'] = "Reversa solicitada por " + $localStorage.user;
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
                                text: "Reversas exitosas " + response.unidadOK + "  Fallidas " + response.unidadFail,
                                type: "success",
                                showCancelButton: false,
                                confirmButtonColor: "#5cc25a",
                                confirmButtonText: "Terminar"
                            }, function (isConfirm) {
                                if (isConfirm) {
                                    getUnitsUnsuscribeByCompany();
                                }
                            });
                        }, function (error) {
                            console.error(error);
                        });
                    } else {
                        SweetAlert.swal('Cancelado!', 'No se reversaron las bajas para las unidades seleccionadas', 'error');
                    }
                });
            };

        });