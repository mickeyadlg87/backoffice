'use strict';

angular.module('backOfficeNewapp')
        .controller('facturationReportController', function ($scope, moment, $localStorage, $location, ngProgressFactory, $http, $rootScope, $window, $timeout, usSpinnerService, facturation, exportXls, DTOptionsBuilder, DTColumnDefBuilder) {

            var arrayData;
            var realm = "rslite";
            var realmBack = "backoffice";
            var dataExport;
            var plataformSelected;
            var valueReportId;

            $scope.realm = realm;
            $scope.showRequired = true;
            $scope.showModal = false;
            $scope.showModalCalenderized = false;
            $scope.showAletError = false;
            $scope.showAletErrorDash = false;
            $scope.showAletErrorReport = false;
            $scope.showAlertExportOk = false;
            $scope.showAletErrorExport = false;

            $scope.typeReport = "Facturacion";

            $scope.barNav = false;
            $scope.success = false;

            console.log("$scope.realm ", $scope.realm);

            //se mostrara "filtro de reporte"
            $scope.filterReport = true;

            $scope.alertsDataReport = [{type: 'danger', msg: 'No se pudieron obtener los primeros cien datos previos al reprote'}];
            $scope.alertsDataDashboards = [{type: 'warning', msg: 'No se pudieron obtener los datos para generar los graficos'}];
            $scope.alertsReportGenerated = [{type: 'danger', msg: 'No se pudo descargar el Reporte de Facturacion'}];
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
                DTColumnDefBuilder.newColumnDef(6),
                DTColumnDefBuilder.newColumnDef(7),
                DTColumnDefBuilder.newColumnDef(8),
                DTColumnDefBuilder.newColumnDef(9)
            ];

            /**
             * grafico tipo venta dona opciones
             */
            $scope.optionsDonut = {
                "chart": {
                    "type": "pieChart",
                    "height": 450,
                    "width": 550,
                    "showLabels": false,
                    "donut": true,
                    "duration": 500,
                    "labelSunbeamLayout": true,
                    "labelThreshold": 0.01,
                    x: function (d) {
                        return d.key;
                    },
                    y: function (d) {
                        return d.y;
                    },
                    valueFormat: function (d) {
                        return d3.format('1f')(d);
                    },
                    "legend": {
                        "margin": {
                            "top": 5,
                            "right": 35,
                            "bottom": 0,
                            "left": 0
                        }
                    }
                }
            };

            /**
             * grafica barras por empresa
             */
            $scope.optionsBar = {
                "chart": {
                    "type": "discreteBarChart",
                    "height": 450,
                    "width": 650,
                    "margin": {
                        "top": 20,
                        "right": 20,
                        "bottom": 50,
                        "left": 55
                    },
                    "showValues": true,
                    "duration": 500,
                    x: function (d) {
                        return d.label;
                    },
                    y: function (d) {
                        return d.value;
                    },
                    valueFormat: function (d) {
                        return d3.format('.0f')(d);
                    },
                    showXAxis: false
                }
            };

            //Funcion principal que recibe informacion para llamar servicio y generar reportes-.
            $scope.$on('search', function (event, data, rangeDate) {
                plataformSelected = data.plataform;
                getfacturationReportFilter();
            });

            /**
             * trae la cantidad de moviles por empresa para graficarlos
             * @returns {Array}
             */
            function getInfoQuantityForCompany() {

                var arrayQForCompany = new Array();
                var arrayToFill = new Array();
                var arrayData = new Array();

                var objForDataCompany = {};
                var objectIntoData = {};
                objectIntoData.key = "Cumulative Return";

                facturation.getQuantityForCompany({
                    'realm': plataformSelected
                }, function (data) {
                    arrayQForCompany = data;
                    if (arrayQForCompany.length >= 1) {
                        angular.forEach(arrayQForCompany, function (valueReportQuantity, key) {
                            objForDataCompany['label'] = valueReportQuantity.company;
                            objForDataCompany['value'] = valueReportQuantity.quantity;

                            arrayToFill.push(objForDataCompany);
                            objForDataCompany = {};
                        });
                        objectIntoData.values = arrayToFill;
                        arrayData.push(objectIntoData);
                    } else {
                        $scope.showAletErrorDash = true;
                    }
                }, function (error) {
                    console.log("error get quantity for type sale");
                    $scope.showAletErrorDash = true;
                });
                return arrayData;
            }

            /**
             * trae la cantidad de equipos por tipo de venta para grafica
             * @returns {Array}
             */
            function getInfoQuantityForTypeSale() {

                var arrayQforSale = new Array();
                var arrayDataDonut = new Array();
                var objForDonut = {};

                facturation.getQuantityForTypeOfSale({
                    'realm': plataformSelected
                }, function (data) {
                    arrayQforSale = data;
                    if (arrayQforSale.length >= 1) {
                        angular.forEach(arrayQforSale, function (valueReportQuantity, key) {
                            objForDonut['key'] = valueReportQuantity.saleTypeName;
                            objForDonut['y'] = valueReportQuantity.quantity;
                            arrayDataDonut.push(objForDonut);
                            objForDonut = {};
                        });
                    } else {
                        $scope.showAletErrorDash = true;
                    }
                }, function (error) {
                    console.log("error get quantity for ccompany");
                    $scope.showAletErrorDash = true;
                });
                return arrayDataDonut;
            }

            function getfacturationReportFilter() {

                var objReport = {};
                var arrayReport = new Array();

                dataExport = new Array();
                arrayData = new Array();

                $scope.reportShow = false;
                usSpinnerService.spin('spinner-1');
                $rootScope.$broadcast('disableButtonSearch', true);
                $rootScope.$broadcast('disableButtonCreate', true);

                /**
                 * Obtiene los primeros cien datos del reporte de facturacion-.
                 */
                facturation.getFacturationReportFilter({
                    'realm': plataformSelected
                }, function (data) {
                    arrayData = data;
                    if (arrayData.length >= 1) {
                        angular.forEach(arrayData, function (valueReport, key) {
                            objReport['companyName'] = valueReport.companyName;
                            objReport['companyToBill'] = valueReport.companyToBill;
                            objReport['deviceTypeName'] = valueReport.deviceTypeName;
                            objReport['gpsCreateDate'] = valueReport.gpsCreateDate;
                            objReport['imei'] = valueReport.imei;
                            objReport['lastActivityDate'] = valueReport.lastActivityDate;
                            objReport['lastEventDate'] = valueReport.lastEventDate;
                            objReport['movilId'] = valueReport.movilId;
                            objReport['movilName'] = valueReport.movilName;
                            objReport['movilState'] = valueReport.movilState;
                            objReport['plan'] = valueReport.plan;
                            objReport['plateNumber'] = valueReport.plateNumber;
                            objReport['rutToBill'] = valueReport.rutToBill;
                            objReport['saleTypeId'] = valueReport.saleTypeId;
                            objReport['saleTypeName'] = valueReport.saleTypeName;
                            objReport['simcard'] = valueReport.simcard;
                            objReport['vin'] = valueReport.vin;
                            objReport['FechaCertificacion'] = valueReport.FechaCertificacion;
                            objReport['proveedor_id'] = valueReport.proveedor_id;
                            objReport['ProveedorSimcard'] = valueReport.ProveedorSimcard;
                            
                            arrayReport.push(objReport);

                            objReport = {};
                        });

                        $scope.dataBar = getInfoQuantityForCompany();
                        $scope.dataDonut = getInfoQuantityForTypeSale();

                        $scope.facturationReport = arrayReport;
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
                    console.log("error get facturation report");
                    $scope.reportShow = false;
                    $rootScope.$broadcast('disableButtonSearch', false);
                    $rootScope.$broadcast('disableButtonCreate', true);
                    $scope.showAletError = true;
                });

            }

            $scope.closeAlertError = function (index) {
                $scope.showAletError = false;
                $scope.showAletErrorDash = false;
                $scope.showAletErrorReport = false;
                $scope.showAlertExportOk = false;
                $scope.showAletErrorExport = false;
            };

            $scope.generateReport = function () {
                $scope.barNav = true;
                $scope.success = true;
                var objAllReport = {};
                var arrayAllReport = new Array();

                insertInfoReport();

                facturation.getAllFacturationReport({
                    'realm': plataformSelected
                }, function (data) {
                    arrayData = data;
                    if (arrayData.length >= 1) {
                        angular.forEach(arrayData, function (valueReport, key) {
                            objAllReport['Empresa'] = valueReport.companyName == null ? "S/I" : valueReport.companyName;
                            objAllReport['Razon Social'] = valueReport.companyToBill == null ? "S/I" : valueReport.companyToBill;
                            objAllReport['Rut'] = valueReport.rutToBill == null ? "S/I" : valueReport.rutToBill;
                            objAllReport['Tipo de Dispositivo'] = valueReport.deviceTypeName == null ? "S/I" : valueReport.deviceTypeName;
                            objAllReport['Fecha Creacion GPS'] = valueReport.gpsCreateDate == null ? "S/I" : moment(valueReport.gpsCreateDate).format("YYYY-MM-DD");
                            objAllReport['Imei'] = valueReport.imei == null ? "S/I" : valueReport.imei;
                            objAllReport['Fecha Ultima Actividad'] = valueReport.lastActivityDate == null ? "S/I" : moment(valueReport.lastActivityDate).format("YYYY-MM-DD");
                            objAllReport['Fecha Ultimo Evento'] = valueReport.lastEventDate == null ? "S/I" : moment(valueReport.lastEventDate).format("YYYY-MM-DD");
                            objAllReport['Fecha Certificacion'] = valueReport.FechaCertificacion == null ? "S/I" : moment(valueReport.FechaCertificacion).format("YYYY-MM-DD");
                            objAllReport['Nombre Movil'] = valueReport.movilName == null ? "S/I" : valueReport.movilName;
                            objAllReport['Estado Movil'] = valueReport.movilState == null ? "S/I" : valueReport.movilState;
                            objAllReport['Plan'] = valueReport.plan == null ? "S/I" : valueReport.plan;
                            objAllReport['Patente'] = valueReport.plateNumber == null ? "S/I" : valueReport.plateNumber;
                            objAllReport['Tipo de Venta'] = valueReport.saleTypeName == null ? "S/I" : valueReport.saleTypeName;
                            objAllReport['SimCard'] = valueReport.simcard == null ? "S/I" : valueReport.simcard;
                            objAllReport['Proveedor SimCard'] = valueReport.ProveedorSimcard == null ? "S/I" : valueReport.ProveedorSimcard;
                            objAllReport['Vin'] = valueReport.vin == null ? "S/I" : valueReport.vin;

                            arrayAllReport.push(objAllReport);

                            objAllReport = {};
                        });
                        exportToExcel(arrayAllReport);
                    } else {
                        $scope.showAletError = true;
                    }
                }, function (error) {
                    console.log("error get all facturation report");
                    $scope.showAletError = true;
                });
            };

            function exportToExcel(dataToGenerated) {
                $scope.showAlertExportOk = false;
                $scope.showAletErrorExport = false;
                var objHeader = {};
                objHeader['Fecha Generacion'] = new Date().toLocaleString();
                exportXls.postExportXls({
                    'title': "Reporte de Facturacion " + plataformSelected,
                    'header': objHeader,
                    'data': dataToGenerated,
                    's3upload': true
                }, function (data) {
                    if (data.status == 1) {
                        $http.get("/export/xls").success(function (datadownload, status) {
                            updateInfoReport(null);
                            $scope.showAlertExportOk = true;
                            $scope.barNav = false;
                            $scope.success = false;
                            // url de descarga del reporte
                            $window.open(datadownload, '_blank');
                        }).error(function (data, status) {
                            updateInfoReport("No se genero el Reporte de Facturacion, error " + status);
                            console.error('Error occurred:', data, status);
                            $scope.showAletErrorExport = true;
                            $scope.barNav = false;
                            $scope.success = false;
                        });
                        
                    } else {
                        updateInfoReport("No se genero el Reporte de Facturacion");
                        $scope.showAletErrorExport = true;
                        $scope.barNav = false;
                        $scope.success = false;
                    }
                }, function (error) {
                    updateInfoReport("Error de conexion");
                    console.error("error al generar excel del reporte: ", error);
                    $scope.showAletErrorExport = true;
                    $scope.barNav = false;
                    $scope.success = false;
                });
            }

            function dataToInsertInfoReport() {
                var objInsertInfo = {};

                objInsertInfo['fileName'] = "Reporte_de_Facturacion_" + new Date().toLocaleString() + ".xls";
                objInsertInfo['reportTypeId'] = 7; /* Id Reporte de Facturacion */
                objInsertInfo['userName'] = $localStorage.user;

                return objInsertInfo;
            }

            function insertInfoReport() {
                facturation.insertReport({
                    'realm': realmBack,
                    'facturation': dataToInsertInfoReport()
                }, function (response) {
                    if (response.result) {
                        valueReportId = response.id;
                    }
                }, function (error) {
                    console.log("Error save insert info report");
                });
            }

            function dataToUpdateInfoReport(error) {
                var objUpdateInfo = {};

                objUpdateInfo['successDate'] = new Date().getTime();
                objUpdateInfo['error'] = error;
                objUpdateInfo['reportId'] = valueReportId;

                return objUpdateInfo;
            }

            function updateInfoReport(error) {
                facturation.updateNewReport({
                    'realm': realmBack,
                    'facturation': dataToUpdateInfoReport(error)
                }, function (response) {
                    if (response.result) {
                        console.log("Reporte actualizado exitosamente");
                    }
                }, function (error) {
                    console.log("No se pudo actualizar el reporte");
                });
            }

        });
