'use strict';

angular.module('backOfficeNewapp')
        .controller('keepAliveController', function ($scope, $localStorage, $location, $http, $rootScope, $window, $timeout, usSpinnerService, exportXls, DTOptionsBuilder, DTColumnDefBuilder) {

            var dataExport;
            var plataformSelected;

            $scope.showAletError = false;
            $scope.showAletErrorDash = false;
            $scope.showAletErrorReport = false;
            $scope.showAlertExportOk = false;
            $scope.showAletErrorExport = false;

            $scope.typeReport = "KeepAlive";

            //se mostrara "filtro de reporte"
            $scope.filterReport = true;

            $scope.alertsDataReport = [{type: 'danger', msg: 'No hay datos disponibles'}];
            $scope.alertsDataDashboards = [{type: 'warning', msg: 'No hay datos para generar graficas'}];
            $scope.alertsReportGenerated = [{type: 'danger', msg: 'No se pudo descargar el reporte'}];
            $scope.alertsExportOk = [{type: 'success', msg: 'El reporte fue exportado exitosamente'}];
            $scope.alertsExport = [{type: 'danger', msg: 'Hubo problemas al exportar, por favor inténtelo nuevamente'}];

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
                DTColumnDefBuilder.newColumnDef(6)
            ];
            
            $scope.optionsTorta = {
                chart: {
                    type: 'pieChart',
                    height: 430,
                    width: 290,
                    x: function (d) {
                        return d.key;
                    },
                    y: function (d) {
                        return d.y;
                    },
                    showLabels: true,
                    duration: 500,
                    labelThreshold: 0.01,
                    labelSunbeamLayout: true,
                    legend: {
                        margin: {
                            top: 5,
                            right: 35,
                            bottom: 5,
                            left: 0
                        }
                    }
                }
            };

            //Funcion principal que recibe informacion para llamar servicio y generar reportes-.
            $scope.$on('search', function (event, data, rangeDate) {
                plataformSelected = data.plataform;
                getKeepAliveReportFilter();
            });


            function getKeepAliveReportFilter() {

                dataExport = new Array();
                $scope.reportShow = false;
                usSpinnerService.spin('spinner-10');
                $rootScope.$broadcast('disableButtonSearch', true);
                $rootScope.$broadcast('disableButtonCreate', true);
                
                // llamado al servicio que trae los resumenes por empresa del keep alive
                $http.get("/backoffice/report/keepAlivePerCustom?realm=" + plataformSelected).success(function (data, status) {
                    if (data.length >= 1) {
                        $scope.customerKeepAlive = data;
                        // Se saca la data para el reporte en excel / pdf
                        dataExport = data.map(function (customkeepalive) {
                            var objReport = {};
                            objReport['R.U.T'] = customkeepalive.companyRut;
                            objReport['Nombre'] = customkeepalive.companyName;
                            objReport['Q Total moviles'] = customkeepalive.total;
                            objReport['Q (con K.A.)'] = customkeepalive.withKA;
                            objReport['Q (sin K.A.)'] = customkeepalive.withoutKA;
                            objReport['% (con K.A.)'] = customkeepalive.percentWithKA;
                            objReport['% (sin K.A.)'] = customkeepalive.percentWithoutKA;
                            return objReport;
                        });
                        // Se saca la data para el grafico porcentual de KA en toda la plataforma
                        var objAgregacion = data.reduce(function (objInicial, customkeepalive) {
                            objInicial.totalconKA = objInicial.totalconKA + customkeepalive.withKA;
                            objInicial.totalsinKA = objInicial.totalsinKA + customkeepalive.withoutKA;
                            objInicial.totalgeneral = objInicial.totalgeneral + customkeepalive.withoutKA + customkeepalive.withKA;
                            return objInicial;
                        }, {totalconKA: 0, totalsinKA: 0, totalgeneral: 0});
                        
                        $scope.dataTorta = [
                            {key: '% Total con KA', y: (objAgregacion.totalconKA / objAgregacion.totalgeneral) * 100},
                            {key: '% Total sin KA', y: (objAgregacion.totalsinKA / objAgregacion.totalgeneral) * 100}
                        ];
                        
                        $scope.reportShow = true;
                    } else {
                        $scope.reportShow = false;
                        $scope.showAletError = true;
                    }
                    usSpinnerService.stop('spinner-10');
                    $rootScope.$broadcast('disableButtonSearch', false);
                }).error(function (data, status) {
                    console.error('Error occurred: ', data, status);
                    usSpinnerService.stop('spinner-10');
                    $scope.reportShow = false;
                    $scope.showAletError = true;
                    $rootScope.$broadcast('disableButtonSearch', false);
                });

            }

            $scope.closeAlertError = function (index) {
                $scope.showAletError = false;
                $scope.showAletErrorDash = false;
                $scope.showAletErrorReport = false;
                $scope.showAlertExportOk = false;
                $scope.showAletErrorExport = false;
            };
            
            //funcion que genera exportar reportes
            $scope.generateReport = function (type) {
                $scope.showAlertExportOk = false;
                $scope.showAletErrorExport = false;
                $scope.showAletErrorReport = false;
                var objHeader = {};
                objHeader['Fecha Generacion'] = new Date().toLocaleString();

                exportXls.postExportXls({
                    'title': "Reporte de Keep Alive por Cliente en : " + plataformSelected,
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
