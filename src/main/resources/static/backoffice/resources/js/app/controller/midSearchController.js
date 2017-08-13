'use strict';

angular.module('backOfficeNewapp')
        .controller('midSearchController', function ($scope, $rootScope, $window, usSpinnerService, unidad, exportXls) {

            var plataformSelected;
            var imeiSent;
            var dataExport;
            
            var pinForMap = {
                image: {
                    icon: {
                        anchor: [0.5, 1],
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'fraction',
                        opacity: 3,
                        src: 'backoffice/resources/images/truck_blue.png'
                    }
                }
            };

            
            $scope.typeReport = "busquedaimei";
            $scope.realm = "rslite";
            
            $scope.showAletError = false;
            $scope.showAlertExportOk = false;
            $scope.showAletErrorExport = false;
            $scope.showSaveParameters = false;
            $scope.showErrorSaveParameters = false;
            
            //se mostrara "filtro de reporte"
            $scope.filterReport = true;                
            
            $rootScope.$broadcast('disableButtonSearch', false);
            $rootScope.$broadcast('disableButtonCreate', true);
            $scope.alertsData = [{type: 'danger', msg: 'No hay datos disponible'}];
            $scope.alertsExport = [{type: 'danger', msg: 'Hubo problemas al exportar, por favor inténtelo nuevamente'}];
            $scope.alertsExportOk = [{type: 'success', msg: 'El reporte fue exportado exitosamente'}];
            $scope.alertSaveParameters = [{type: 'success', msg: 'Los parámetros han sido modificados correctamente'}];
            $scope.alertErrorSaveParameters = [{type: 'danger', msg: 'Ha ocurrido un error al intentar modificar los parámetros, favor volver a intentar'}];
            
            //Funcion principal que recibe informacion para llamar servicio y generar reportes
            $scope.$on('search', function (event, data, rangeDate) {

                $scope.showAletError = false;
                plataformSelected = data.plataform;
                imeiSent = data.imeiNumber;

                getImeiInfo();

            });
            
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
            
            // open layers config
            $scope.mapConfig = {
                interactions: {
                    mouseWheelZoom: true
                }
            };
            
            $scope.center = {
                lat: 0,
                lon: 0,
                zoom: 14
            };
            
            $scope.marker = {
                lat: 0,
                lon: 0,
                style: pinForMap
            };
                 
            function getImeiInfo() {

                var objUnit = {};
                var lastState = {};
                var dataExportObj = {};
                var sensor = {};
                var objSensor = {};
                var arraySensor = new Array();
                var versionData = {};
                var objVersion = {};
                var arrayVersion = new Array();
                dataExport = new Array();
                $scope.reportShow = false;
                usSpinnerService.spin('spinner-7');
                $rootScope.$broadcast('disableButtonSearch', true);
                $rootScope.$broadcast('disableButtonCreate', true);
                
                unidad.getUnitByImei({
                    'realm': plataformSelected,
                    'modemId': imeiSent
                }, function (response) {
                    if (response.status) {
                        objUnit = response;
                        if (objUnit.lastPosition) {
                            lastState = objUnit.lastPosition;
                            lastState.speed = lastState.speed == null ? "S/I" : lastState.speed;
                            lastState.eventId = lastState.eventId == null ? "S/I" : lastState.eventId;
                            lastState.odo = lastState.odo == null ? "S/I" : lastState.odo;
                        };
                        if (objUnit.sensors){
                            sensor = objUnit.sensors;
                            angular.forEach(sensor, function (value, key) {
                                objSensor['name'] = key;
                                objSensor['quantity'] = value;
                                arraySensor.push(objSensor);
                                objSensor = {};
                            });
                            objUnit.arraySensor = arraySensor;
                        }
                        if (objUnit.version){
                            versionData = objUnit.version;
                            angular.forEach(versionData, function (value, key) {
                                objVersion['name'] = key;
                                objVersion['data'] = value;
                                arrayVersion.push(objVersion);
                                objVersion = {};
                            });
                            objUnit.arrayVersion = arrayVersion;
                        }
                                                
                        $scope.reportShow = true;
                    } else {
                        $scope.showAletError = true;
                    }
                    $scope.unidadImei = objUnit;
                    $scope.unidadLastState = lastState;
                    
                    /*** export to pdf - excel ***/
                    dataExportObj['Latitud'] = lastState.lat;
                    dataExportObj['Longitud'] = lastState.lng;
                    dataExportObj['Odometro'] = lastState.odo;
                    dataExportObj['Horometro'] = lastState.hourmeter;
                    dataExportObj['Velocidad'] = lastState.speed;
                    dataExportObj['Azimuth'] = lastState.azimuth;
                    dataExportObj['altitud'] = lastState.alt;
                    dataExportObj['Ultimo Evento (ID)'] = lastState.eventId;
                    dataExportObj['Fecha de última actividad'] = new Date(lastState.date).toLocaleString();
                    dataExportObj['Ultimo Id'] = objUnit.alt;
                    dataExportObj['Ultima Ip de Origen'] = objUnit.lastSourceIp;
                    dataExportObj['Ultima Ip Reportada'] = objUnit.lastReportingIp;
                    dataExportObj['Ultimo Puerto de Origen'] = objUnit.lastSourcePort;
                    dataExportObj['Ultimo Puerto Reportado'] = objUnit.lastReportingPort;

                    dataExport.push(dataExportObj);

                    $scope.center = {
                        lat: lastState.lat,
                        lon: lastState.lng,
                        zoom: 14
                    };

                    $scope.marker = {
                        lat: lastState.lat,
                        lon: lastState.lng
//                        style: {
//                            image: {
//                                icon: {
//                                    anchor: [0.5, 1],
//                                    anchorXUnits: 'fraction',
//                                    anchorYUnits: 'fraction',
//                                    opacity: 3,
//                                    src: 'backoffice/resources/images/truck_red.png'
//                                }
//                            }
//                        }
                    };
//                    angular.extend($scope, {
//                        center: {
//                            lat: lastState.latitude,
//                            lon: lastState.longitude,
//                            zoom: 14
//                        },
//                        marker: {
//                            lat: lastState.latitude,
//                            lon: lastState.longitude,
//                            style : actualPinForMap
//                        }
//                    });
                    
                    usSpinnerService.stop('spinner-7');
                    $rootScope.$broadcast('disableButtonSearch', false);
                    $rootScope.$broadcast('disableButtonCreate', true);

                }, function (error) {
                    console.log("error get vehicle");                  
                    $scope.showAletError = true;
                    usSpinnerService.stop('spinner-7');
                    $rootScope.$broadcast('disableButtonSearch', false);
                    $rootScope.$broadcast('disableButtonCreate', true);
                });
                                
            }
            
            //funcion que genera exportar reportes
            $scope.generateReport = function (type) {
                $scope.showAlertExportOk = false;
                $scope.showAletErrorExport = false;
                var objHeader = {};
                objHeader['Plataforma'] = plataformSelected;
                objHeader['Imei'] = imeiSent;
                objHeader['Fecha Generacion'] = new Date().toLocaleString();

                exportXls.postExportXls({
                    'title': "Dispositivo con id " + imeiSent,
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
