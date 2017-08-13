'use strict';

angular.module('backOfficeNewapp')
        .controller('unsubscribeReportController', function ($scope, $localStorage, $http, $rootScope, $window, $timeout, usSpinnerService, unsubscribe, exportXls, DTOptionsBuilder, DTColumnDefBuilder) {

            var arrayData;
            var realm = "rslite";
            var dataExport;
            var plataformSelected;
            var dateFrom;
            var dateTo;

            $scope.typeReport = "unsubscribeReport";

            $scope.showAletError = false;
            $scope.showAlertExportOk = false;
            $scope.showAletErrorExport = false;

            $scope.barNav = false;
            $scope.success = false;

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
                unsubscribe.getUnsubcribeReport({
                    'realm': plataformSelected,
                    'from': dateFrom,
                    'to': dateTo
                }, function (data) {
                    arrayData = data;
                    if (arrayData.length >= 1) {
                        angular.forEach(arrayData, function (value, key) {
                            objReport['companyName'] = value.companyName;
                            objReport['downDate'] = value.downDate;
                            objReport['imei'] = value.imei;
                            objReport['plateNumber'] = value.plateNumber;
                            objReport['registerBy'] = value.registerBy;
                            objReport['simcard'] = value.simcard;
                            objReport['unitName'] = value.unitName;
                            objReport['validateDate'] = value.validateDate;
                            objReport['vin'] = value.vin;
                            
                            dataExportObj['Empresa'] = value.companyName;
                            dataExportObj['Fecha Baja'] = new Date(value.downDate + $rootScope.offsetTimeZone).toLocaleString();
                            dataExportObj['Imei'] = value.imei;
                            dataExportObj['Patente'] = value.plateNumber;
                            dataExportObj['Observacion'] = value.registerBy;
                            dataExportObj['SimCard'] = value.simcard;
                            dataExportObj['Nombre'] = value.unitName;
                            dataExportObj['Fecha Validacion'] = new Date(value.validateDate + $rootScope.offsetTimeZone).toLocaleString();
                            dataExportObj['Vin'] = value.vin;

                            arrayReport.push(objReport);
                            dataExport.push(dataExportObj);

                            objReport = {};
                            dataExportObj = {};
                        });

                        $scope.unsubscribeViewReport = arrayReport;
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
                    console.log("error get unsubscribe report");
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
                $scope.showAletErrorAccessories = false;
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
                    'title': "Reporte Unidades de Baja " + plataformSelected,
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



