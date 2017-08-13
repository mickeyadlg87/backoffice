'use strict';

angular.module('backOfficeNewapp')
        .controller('reportDeviceCertifiedController', function ($scope, $localStorage, $http, accesorydevice, $rootScope, $window, usSpinnerService, exportXls, DTOptionsBuilder, DTColumnDefBuilder) {

            var arrayData;
            var dataExport;
            var dateFrom;
            var dateTo;

            $scope.typeReport = "deviceCertifiedReport";

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
                dateFrom = new Date(data.datefrom).getTime();
                dateTo = new Date(data.dateTo).getTime();
                getDeviceCertReportFilter();
            });

            //definicion de columnas para utilizar datatables de angular
            $scope.dtOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
                    .withLanguageSource('http://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json');
            $scope.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0),
                DTColumnDefBuilder.newColumnDef(1),
                DTColumnDefBuilder.newColumnDef(2),
                DTColumnDefBuilder.newColumnDef(3)
            ];

            function getDeviceCertReportFilter() {
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
                 * Obtiene los dispositivos certificados registrados en backoffice
                 */
                accesorydevice.getAccesoriesForReport({
                    'realm': 'backoffice',
                    'from': dateFrom - $rootScope.offsetTimeZone,
                    'to': dateTo - $rootScope.offsetTimeZone
                }, function (data) {
                    arrayData = data;
                    if (arrayData.length >= 1) {
                        angular.forEach(arrayData, function (value, key) {
                            objReport['imei'] = value.imei;
                            objReport['username'] = value.username;
                            objReport['validationDate'] = value.validationDate + $rootScope.offsetTimeZone;
                            // se toma el JSON de accesorios y se concatenan unicamente los nombres, se quita el ultimo separador
                            objReport['accesoriesStringList'] = JSON.parse(value.installedAccesory).reduce(function (concat, accessory) {
                                return accessory.accesoryName + ' , ' + concat;
                            }, '').trim().slice(0, -1);

                            dataExportObj['Imei'] = value.imei;
                            dataExportObj['Usuario Certificador'] = value.username;
                            dataExportObj['Fecha Certificacion'] = new Date(value.validationDate + $rootScope.offsetTimeZone).toLocaleString();
                            dataExportObj['Accesorios'] = objReport['accesoriesStringList'].length > 0 ? objReport['accesoriesStringList'] : 'S/I';

                            arrayReport.push(objReport);
                            dataExport.push(dataExportObj);

                            objReport = {};
                            dataExportObj = {};
                        });

                        $scope.devCertifiedViewReport = arrayReport;
                        $scope.reportShow = true;
                    } else {
                        $scope.reportShow = false;
                        $scope.showAletError = true;
                    }
                    usSpinnerService.stop('spinner-1');
                    $rootScope.$broadcast('disableButtonSearch', false);
                }, function (err) {
                    usSpinnerService.stop('spinner-1');
                    console.error("error reporte dispositivos certificados ", err);
                    $scope.reportShow = false;
                    $rootScope.$broadcast('disableButtonSearch', false);
                    $scope.showAletError = true;
                });
            }

            $scope.closeAlertError = function (index) {
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
                    'title': "Reporte Dispositivos Certificados",
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



