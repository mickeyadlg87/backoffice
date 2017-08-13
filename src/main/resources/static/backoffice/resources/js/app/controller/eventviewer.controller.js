'use strict';

angular.module('backOfficeNewapp')
        .controller('eventViewerController', function ($scope, $rootScope, $window, $anchorScroll, $location, usSpinnerService, eventdevice, exportXls, DTOptionsBuilder, DTColumnDefBuilder) {

            var imeiSent;
            var dataExport;
            var dateFrom;
            var dateTo;
            var arrayData;
            var maxNumDays = 3; // max num de dias para visualizar eventos
            
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

            
            $scope.typeReport = "visualizadorEventos";
            $scope.realm = "rslite";
            
            $scope.showAletError = false;
            $scope.showAlertExportOk = false;
            $scope.showAletErrorExport = false;
            $scope.showAletMaxDaysSel = false;
            
            //se mostrara "filtro de reporte"
            $scope.filterReport = true;                
            
            $rootScope.$broadcast('disableButtonSearch', false);
            $rootScope.$broadcast('disableButtonCreate', true);
            $scope.alertsData = [{type: 'danger', msg: 'No hay datos disponible'}];
            $scope.alertsExport = [{type: 'danger', msg: 'Hubo problemas al exportar, por favor inténtelo nuevamente'}];
            $scope.alertsExportOk = [{type: 'success', msg: 'El reporte fue exportado exitosamente'}];
            $scope.alertsMaxDaysSelected = [{type: 'warning', msg: 'Seleccione un periodo menor a ' + maxNumDays + ' días'}];
            
            //definicion de columnas para utilizar datatables de angular
            $scope.dtOptions = DTOptionsBuilder.newOptions()
                    .withPaginationType('full_numbers')
//                .withColVis()
//                .withColVisStateChange(function (iColumn, bVisible) {
//                    console.log('The column' + iColumn + ' has changed its status to ' + bVisible)
//                })
//                .withColVisOption('aiExclude', [3])
                    .withLanguageSource('http://cdn.datatables.net/plug-ins/1.10.9/i18n/Spanish.json')
                    .withOption('rowCallback', rowCallback);
            
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
                DTColumnDefBuilder.newColumnDef(9),
                DTColumnDefBuilder.newColumnDef(10),
                DTColumnDefBuilder.newColumnDef(11),
                DTColumnDefBuilder.newColumnDef(12),
                DTColumnDefBuilder.newColumnDef(13),
                DTColumnDefBuilder.newColumnDef(14),
                DTColumnDefBuilder.newColumnDef(15),
                DTColumnDefBuilder.newColumnDef(16),
                DTColumnDefBuilder.newColumnDef(17),
                DTColumnDefBuilder.newColumnDef(18),
                DTColumnDefBuilder.newColumnDef(19),
                DTColumnDefBuilder.newColumnDef(20),
                DTColumnDefBuilder.newColumnDef(21),
                DTColumnDefBuilder.newColumnDef(22),
                DTColumnDefBuilder.newColumnDef(23),
                DTColumnDefBuilder.newColumnDef(24),
                DTColumnDefBuilder.newColumnDef(25),
                DTColumnDefBuilder.newColumnDef(26),
                DTColumnDefBuilder.newColumnDef(27),
                DTColumnDefBuilder.newColumnDef(28),
                DTColumnDefBuilder.newColumnDef(29),
                DTColumnDefBuilder.newColumnDef(30),
                DTColumnDefBuilder.newColumnDef(31),                
                DTColumnDefBuilder.newColumnDef(32)
            ];

            
            
            //Funcion principal que recibe informacion para llamar servicio y generar reportes
            $scope.$on('search', function (event, data, rangeDate) {

                $scope.showAletError = false;
                $scope.showAletMaxDaysSel = false;
                imeiSent = data.imeiNumber;
                dateFrom = new Date(data.datefrom).getTime();
                dateTo = new Date(data.dateTo).getTime();
                // si selecciona un rango de tiempo mayor a maxNumDys, no efectua la busqueda
                if ((dateTo - dateFrom) >= (maxNumDays * 24 * 60 * 60 * 1000)) {
                    $scope.showAletMaxDaysSel = true;
                } else {
                    centerMarkerMap();
                    getEventsImeiInfo();
                }
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
            
            $scope.closeAlertMaxDays = function (index) {
                $scope.showAletMaxDaysSel = false;
            };

            // open layers config
            $scope.mapConfig = {
                interactions: {
                    mouseWheelZoom: false
                },
                controls: {
                    zoom: true,
                    rotate: false,
                    attribution: false
                }
            };
            
            function centerMarkerMap() {
                $scope.center = {
                    lat: 0,
                    lon: 0,
                    zoom: 2
                };

                $scope.marker = {
                    lat: 0,
                    lon: 0,
                    style: pinForMap
                };
            }
            // se inicializa el mapa
            centerMarkerMap();
                 
            function getEventsImeiInfo() {

                arrayData = new Array();
                dataExport = new Array();
                $scope.reportShow = false;
                usSpinnerService.spin('spinner-7');
                $rootScope.$broadcast('disableButtonSearch', true);
                $rootScope.$broadcast('disableButtonCreate', true);
                
                eventdevice.getAllEventsByMid({
                    'mid': imeiSent,
                    'from': dateFrom,
                    'to': dateTo   
                }, function (data) {
                    if (data.length > 0) {
                        arrayData = data;
//                        console.log("arrayData:  ", arrayData[0]);
                        $scope.eventListPerMid = arrayData;
                        dataExport = arrayData;
                        $scope.reportShow = true;
                    } else {
                        $scope.showAletError = true;
                    }
                    usSpinnerService.stop('spinner-7');
                    $rootScope.$broadcast('disableButtonSearch', false);
                    $rootScope.$broadcast('disableButtonCreate', true);

                }, function (error) {
                    console.error("error get vehicle", error);                  
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
                objHeader['Imei'] = imeiSent;
                objHeader['Desde'] = new Date(dateFrom).toLocaleString();
                objHeader['Hasta'] = new Date(dateTo).toLocaleString();
                objHeader['Fecha Generacion'] = new Date().toLocaleString();

                exportXls.postExportXls({
                    'title': "Reporte de eventos para dispositivo " + imeiSent,
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
            
            /**
             * Funcion para ubicar en el mapa el evento seleccionado de la tabla
             * @param {type} eventoSel
             * @returns {undefined}
             */
            $scope.clickRowEvent = function (eventoSel) {
            
                $scope.center = {
                    lat: eventoSel.latitude,
                    lon: eventoSel.longitude,
                    zoom: 14
                };
                
                $scope.marker = {
                    lat: eventoSel.latitude,
                    lon: eventoSel.longitude
                };
                
                
                if ($location.hash() !== "mapContainer") {
                    // set the $location.hash to `mapContainer` and
                    // $anchorScroll will automatically scroll to it
                    $location.hash("mapContainer");
                } else {
                    // call $anchorScroll() explicitly,
                    // since $location.hash hasn't changed
                    $anchorScroll();
                }
            };
            
            /**
             * accion ejecutada al dar click sobre una fila de la tabla
             * se usa para cambiar el color de la fila seleccionada
             * @param {type} nRow
             * @param {type} aData
             * @param {type} iDisplayIndex
             * @param {type} iDisplayIndexFull
             * @returns {undefined}
             */
            function rowCallback(nRow) {
                $(nRow).on('click', function (e) {
                    $(nRow).toggleClass('selected');
                });
            }
                                        
        });
