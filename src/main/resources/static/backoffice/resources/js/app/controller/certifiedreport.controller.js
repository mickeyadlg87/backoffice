'use strict';

angular.module('backOfficeNewapp')
        .controller('certifiedReportController', function ($scope, moment, $localStorage, $location, ngProgressFactory, $http, $rootScope, $window, $timeout, usSpinnerService, unidad, exportXls, DTOptionsBuilder, DTColumnDefBuilder) {

            var arrayData;
            var realm = "rslite";
            var realmBack = "backoffice";
            var dataExport;
            var plataformSelected;
            var dateFrom;
            var dateTo;
            
            $scope.typeReport = "certifiedReport";

           $scope.showAletError = false;
            $scope.showAlertExportOk = false;
            $scope.showAletErrorExport = false;

            //se mostrara "filtro de reporte"
            $scope.filterReport = true;
            
            $scope.alertError = [{type: 'danger', msg: 'No hay datos disponibles'}];
            $scope.alertsExportOk = [{type: 'success', msg: 'El reporte fue exportado exitosamente'}];
            $scope.alertsExport = [{type: 'danger', msg: 'Hubo problemas al exportar, por favor inténtelo nuevamente'}];

            //Funcion principal que recibe informacion para llamar servicio y generar reportes-.
            $scope.$on('search', function (event, data, rangeDate) {
                plataformSelected = data.plataform;
                dateFrom = new Date(data.datefrom).getTime();
                dateTo = new Date(data.dateTo).getTime();
                getUnsubscribereportFilter();
            });

            //definicion de columnas para utilizar datatables de angular
            $scope.dtOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
                    .withLanguageSource('http://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
            $scope.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0),
                DTColumnDefBuilder.newColumnDef(1),
                DTColumnDefBuilder.newColumnDef(2),
                DTColumnDefBuilder.newColumnDef(3),
                DTColumnDefBuilder.newColumnDef(4),
                DTColumnDefBuilder.newColumnDef(5),
                DTColumnDefBuilder.newColumnDef(6),
                DTColumnDefBuilder.newColumnDef(7),
                DTColumnDefBuilder.newColumnDef(8)
            ];

            function getUnsubscribereportFilter() {
                var objReport = {};
                var arrayReport = new Array();
                var dataExportObj = {};
                dataExport = new Array();
                arrayData = new Array();

                $scope.reportShow = false;
                usSpinnerService.spin('spinner-1');
                $rootScope.$broadcast('disableButtonSearch', true);
                $rootScope.$broadcast('disableButtonCreate', true);

                /**
                 * Obtiene los primeros cien datos del reporte de facturacion-.
                 */
                unidad.getCertifiedReport({
                    'realm' : realmBack,
                    'platform': plataformSelected,
                    'from': dateFrom,
                    'to': dateTo
                }, function (data) {
                    arrayData = data;
                    if (arrayData.length > 0) {
                        angular.forEach(arrayData, function (value, key) {
                            objReport['vin'] = value.vin;
                            objReport['imei'] = value.imei;
                            objReport['username'] = value.username;
                            objReport['creationUnitDate'] = value.creationUnitDate;
                            objReport['deviceValidationDate'] = value.deviceValidationDate;
                            objReport['plateNumber'] = value.plateNumber;
                            objReport['unitName'] = value.unitName;
                            objReport['companyName'] = value.companyName;
                            objReport['actionDate'] = value.actionDate;
                            
                            dataExportObj['Empresa'] = value.companyName == null ? "S/I" : value.companyName;
                            dataExportObj['Id Unidad'] = value.unitId == null ? "S/I" : value.unitId;
                            dataExportObj['Nombre Unidad'] = value.unitName == null ? "S/I" : value.unitName;
                            dataExportObj['Imei'] = value.imei == null ? "S/I" : value.imei;
                            dataExportObj['Vin'] = value.vin == null ? "S/I" : value.vin;
                            dataExportObj['Patente'] = value.plateNumber == null ? "S/I" : value.plateNumber;
                            dataExportObj['Tipo Venta'] = value.TypeSale == null ? "S/I" : value.TypeSale;
                            dataExportObj['Empresa a Facturar'] = value.companyNameToBill == null ? "S/I" : value.companyNameToBill;
                            dataExportObj['Usuario Certificador'] = value.username == null ? "S/I" : value.username;
                            dataExportObj['Fecha Certificacion'] = value.actionDate == null ? "S/I" : moment(value.actionDate).format("YYYY-MM-DD HH:mm:ss");
                            dataExportObj['Fecha Creacion Unidad'] = value.creationUnitDate == null ? "S/I" : moment(value.creationUnitDate).format("YYYY-MM-DD HH:mm:ss");
                            dataExportObj['Fecha Ultima Actividad'] = value.lastActivityDate == null ? "S/I" : moment(value.lastActivityDate).format("YYYY-MM-DD HH:mm:ss");
                            dataExportObj['Fecha Validacion Dispositivo'] = value.deviceValidationDate == null ? "S/I" : moment(value.deviceValidationDate).format("YYYY-MM-DD HH:mm:ss");

                            arrayReport.push(objReport);
                            dataExport.push(dataExportObj);

                            objReport = {};
                            dataExportObj = {};
                        });

                        $scope.certifiedViewReport = arrayReport;
                        $scope.reportShow = true;
                    } else {
                        $scope.reportShow = false;
                        $scope.showAletError = true;
                    }
                    usSpinnerService.stop('spinner-1');
                    $rootScope.$broadcast('disableButtonSearch', false);
                    $rootScope.$broadcast('disableButtonCreate', true);
                }, function (error) {
                    usSpinnerService.stop('spinner-1');
                    console.log("error get certified report");
                    $scope.reportShow = false;
                    $rootScope.$broadcast('disableButtonSearch', false);
                    $rootScope.$broadcast('disableButtonCreate', true);
                    $scope.showAletError = true;
                });
            }

            $scope.closeAlertError = function (index) {
                $scope.showSaveParameters = false;
                $scope.showErrorSaveParameters = false;
                $scope.showErrorSimCard = false;
                $scope.showAletErrorAccessories = false
                $scope.showAletError = false;
                $scope.showAlertExportOk = false;
                $scope.showAletErrorExport = false;
            };
            
            //funcion que genera exportar reportes
            $scope.generateReport = function (type) {

                $scope.showAlertExportOk = false;
                $scope.showAletErrorExport = false;
                var objHeader = {};
                objHeader['Fecha Generacion'] = new Date().toLocaleString();

                exportXls.postExportXls({
                    'title': "Reporte Unidades Certificadas " + plataformSelected,
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

        });



