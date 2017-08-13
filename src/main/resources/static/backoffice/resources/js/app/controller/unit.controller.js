'use strict';

angular.module('backOfficeNewapp')
        .controller('unitController', function ($scope, $timeout, unsubscribe, company, $rootScope, $window, usSpinnerService, unidad, exportXls, DTOptionsBuilder, DTColumnDefBuilder) {

            var arrayData;
            var arrayType;
            var realm = "rslite";
            var realmBack = "backoffice";
            var dataExport;
            var plataformSelected;
            var limite;
            var off;
            var companySelected = {};
            var successModalOperation = false;

            $scope.waitMap = false;
            $scope.ifLaststate = false;

            $scope.dataModal = {};
            $scope.dataModalInsert = {};

            $scope.realm = realm;
            $scope.showRequired = true;
            $scope.showModal = false;
            $scope.showModalCalenderized = false;
            $scope.showAletError = false;
            $scope.showAletErrorWeek = false;
            $scope.showAletErrorMonth = false;
            $scope.showAlertSendEmail = false;
            $scope.showAlertExportOk = false;
            $scope.showAletErrorExport = false;
            $scope.showAlertErrorDateSelected = false;
            $scope.showSaveParameters = false;
            $scope.showErrorSaveParameters = false;

            $scope.showModalProfileConfigUser = false;
            $scope.typeReport = "unidades";

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
                DTColumnDefBuilder.newColumnDef(5).notSortable() // Editar
            ];

            //Funcion principal que recibe informacion para llamar servicio y generar reportes
            $scope.$on('search', function (event, data, rangeDate) {

                $scope.showAletErrorWeek = false;
                $scope.showAletErrorMonth = false;
                $scope.showAletError = false;
                $scope.showAlertErrorDateSelected = false;

                plataformSelected = data.plataform;
                companySelected = data.companySelected;
                limite = data.rangeSel ? JSON.parse(data.rangeSel).limit : undefined;
                off = data.rangeSel ? JSON.parse(data.rangeSel).offset : undefined;

                getUnitsByCompany();
                getCustomerForFact();
                getTypeSale();
            });

            $scope.$on('create', function (event, dataFiltered) {
                $scope.showModalAddClient = true;
                $scope.showSaveParameters = false;
                $scope.showErrorSaveParameters = false;
                successModalOperation = false;
            });
            
            function getCustomerForFact() {
                var objCompanyForGroup = {};
                var arrayCompanyForGroup = new Array();
                company.getCompanyList({
                    'realm': plataformSelected,
                    'limit': 0,
                    'offset': 0
                }, function (data) {
                    arrayData = data;
                    if (arrayData.length >= 1) {
                        angular.forEach(arrayData, function (valueCompany, key) {
                            objCompanyForGroup['id'] = valueCompany.id;
                            objCompanyForGroup['name'] = valueCompany.name;
                            arrayCompanyForGroup.push(objCompanyForGroup);
                            objCompanyForGroup = {};
                        });
                        $scope.customerGroupFact = arrayCompanyForGroup;
                    } else {
                        $scope.showAletError = true;
                    }
                }, function (error) {
                    console.error("error get companies", error);
                    $scope.showAletError = true;
                });
            }
            
            function getTypeSale(){
                arrayType = new Array();
                var arrayTypeSale = new Array();
                var objSale = {};
                unsubscribe.getGeneralState({
                    'realm': realmBack,
                    'codeName': 'TYPE_SALE'
                }, function (dta) {
                    arrayType = dta;
                    if (arrayType) {
                        angular.forEach(arrayType, function (val, ky) {
                            objSale['reason'] = val.descriptionState;
                            objSale['id'] = val.descriptionId;
                            arrayTypeSale.push(objSale);
                            objSale = {};
                        });
                        $scope.modalidadGroup = arrayTypeSale;
                    } else {
                        $scope.modalidadGroup = "Sin Datos";
                    }
                }, function (error) {
                    $scope.modalidadGroup = "Sin Datos";
                    console.log("error al obtener informacion tipo de venta");
                });
            }

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
                            objUnit['validateDate'] = valueUnit.validateDate;
                            objUnit['facturationCustomerId'] = valueUnit.facturationCustomerId;
                            objUnit['unitTypeSale'] = valueUnit.unitTypeSale;
                            objUnit['engineType'] = valueUnit.engineTypeId;
                            objUnit['subVehicleType'] = valueUnit.subVehicleTypeId;

                            /***** LastState *****/
                            objUnit['geotext'] = valueUnit.lastState.geotext == null ? "S/I" : valueUnit.lastState.geotext;
                            objUnit['latitude'] = valueUnit.lastState.latitude;
                            objUnit['longitude'] = valueUnit.lastState.longitude;
                            objUnit['odometer'] = valueUnit.lastState.odometer == null ? "S/I" : valueUnit.lastState.odometer;
                            objUnit['hourmeter'] = valueUnit.lastState.hourmeter == null ? "S/I" : valueUnit.lastState.hourmeter;
                            objUnit['stateImg'] = valueUnit.lastState.stateImg == null ? 'backoffice/resources/images/truck_blue.png' : valueUnit.lastState.stateImg;
                            objUnit['dateUnit'] = valueUnit.lastState._t == null ? "S/I" : valueUnit.lastState._t;


                            /*** export to pdf - excel ***/
                            dataExportObj['Compañia'] = valueUnit.company;
                            dataExportObj['Nombe'] = valueUnit.name;
                            dataExportObj['Vin'] = valueUnit.vin;
                            dataExportObj['Patente'] = valueUnit.plateNumber;
                            dataExportObj['Tipo Vehiculo'] = valueUnit.vehicleTypeName;
                            dataExportObj['Simcard'] = valueUnit.simcard;
                            dataExportObj['Odometro'] = valueUnit.odometer;
                            dataExportObj['Horometro'] = valueUnit.hourmeter;

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
//                    $rootScope.$broadcast('disableButtonCreate', false);
                    $rootScope.$broadcast('disableButtonCreate', true);
                }, function (error) {
                    usSpinnerService.stop('spinner-6');
                    console.log("error get units");
                    $scope.reportShow = false;
                    $rootScope.$broadcast('disableButtonSearch', false);
//                    $rootScope.$broadcast('disableButtonCreate', false);
                    $rootScope.$broadcast('disableButtonCreate', true);
                    $scope.showAletError = true;
                });
            }

            //funcion que genera exportar reportes
            $scope.generateReport = function (type) {

                $scope.showAlertExportOk = false;
                $scope.showAletErrorExport = false;
                var objHeader = {};
                objHeader['Fecha Generacion'] = new Date().toLocaleString();

                exportXls.postExportXls({
                    'title': "Reporte de Unidades Backoffice" + plataformSelected,
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

            $rootScope.$broadcast('disableButtonSearch', false);
            $rootScope.$broadcast('disableButtonCreate', true);
            $scope.alertsData = [{type: 'danger', msg: 'No hay datos disponible'}];
            $scope.alertsDateMonth = [{type: 'danger', msg: 'Los días seleccionados no pueden superar el mes'}];
            $scope.alertsDateWeek = [{type: 'danger', msg: 'Los días seleccionados no pueden superar una semana'}];
            $scope.alertsExport = [{type: 'danger', msg: 'Hubo problemas al exportar, por favor inténtelo nuevamente'}];
            $scope.alertsSendEmail = [{type: 'success', msg: 'El reporte fue enviado por email'}];
            $scope.alertsExportOk = [{type: 'success', msg: 'El reporte fue exportado exitosamente'}];
            $scope.alertsDate = [{type: 'danger', msg: 'La fecha final de búsqueda debe ser mayor que la fecha inicial.'}];
            $scope.alertSaveParameters = [{type: 'success', msg: 'Los parámetros han sido modificados correctamente'}];
            $scope.alertErrorSaveParameters = [{type: 'danger', msg: 'Ha ocurrido un error al intentar modificar los parámetros, favor volver a intentar'}];

            $scope.closeAlertError = function (index) {
                $scope.showAletError = false;
                $scope.showAletErrorWeek = false;
                $scope.showAletErrorMonth = false;
                $scope.showAlertSendEmail = false;
                $scope.showAlertExportOk = false;
                $scope.showAletErrorExport = false;
                $scope.showSaveParameters = false;
                $scope.showErrorSaveParameters = false;
            };

            $scope.showCalenderized = function () {
                console.log("showCalenderized");
                $scope.showModalCalenderized = true;
            };

            //llama a directiva sendMail para mostrar modal
            $scope.callModal = function () {
                $rootScope.$broadcast('callModal');
                $scope.showModal = true;
            };

            $scope.mapConfig = {
                interactions: {
                    mouseWheelZoom: true
                }
            };

            /**
             * editar informacion de la Unidad
             * @param {type} unit
             * @returns {undefined}
             */
            $scope.editUnit = function (unitData) {

                $timeout(function () {
                    $scope.waitMap = true;
                }, 1000);
                
                $scope.dataModalUnit = {};
                $scope.showSaveParameters = false;
                $scope.showErrorSaveParameters = false;
                successModalOperation = false;

                $scope.dataModalUnit.unitCompany = unitData.company;
                $scope.dataModalUnit.unitCompanyId = unitData.idCompany;
                $scope.dataModalUnit.unitPlateNumber = unitData.plateNumber;
                $scope.dataModalUnit.unitName = unitData.name;
                $scope.dataModalUnit.unitVin = unitData.vin;
                $scope.dataModalUnit.unitImei = unitData._m;
                $scope.dataModalUnit.unitSimcard = unitData.simcard;
                $scope.dataModalUnit.unitTypeName = unitData.vehicleTypeName;
                $scope.dataModalUnit.unitSubVehicleType = unitData.subVehicleType;
                $scope.dataModalUnit.unitEngineType = unitData.engineType;
                $scope.dataModalUnit.unitId = unitData.vehicleId;
                $scope.dataModalUnit.unitExtraFields = unitData.extraFields;
                $scope.dataModalUnit.unitValidateDate = unitData.validateDate;
                $scope.dataModalUnit.unitFacturationCustomerId = unitData.facturationCustomerId;
                $scope.dataModalUnit.unitTypeSale = unitData.unitTypeSale;
                
                $scope.dataModalUnit.unitLat = unitData.latitude;
                $scope.dataModalUnit.unitLon = unitData.longitude;
                $scope.dataModalUnit.unitGeotext = unitData.geotext;
                $scope.dataModalUnit.unitOdometer = unitData.odometer;
                $scope.dataModalUnit.uniHourmeter = unitData.hourmeter == "S/I" ? unitData.hourmeter : (unitData.hourmeter / 3600).toFixed(2);
                $scope.dataModalUnit.unitDate = unitData.dateUnit == "S/I" ? unitData.dateUnit : new Date(unitData.dateUnit).toLocaleString();

                $scope.markerColor = unitData.stateImg;

                $scope.center = {
                    lat: unitData.latitude,
                    lon: unitData.longitude,
                    zoom: 14
                };

                $scope.marker = {
                    lat: unitData.latitude,
                    lon: unitData.longitude,
                    style: {
                        image: {
                            icon: {
                                anchor: [0.5, 1],
                                anchorXUnits: 'fraction',
                                anchorYUnits: 'fraction',
                                opacity: 3,
                                src: unitData.stateImg
                            }
                        }
                    }
                };

                $scope.showModalUnit = true;

            };
            
            $scope.$watch('center', function () {
                return $scope.center;
            });

            $scope.$watch('marker', function () {
                return $scope.marker;
            });

            /**
             * 
             * @param {type} dataUpdateParameters
             * @returns {dataToRequest.objUnit}
             * Update Unit
             */
            function dataToUpdateUnit(dataUpdateParameters) {
                var objUnit = {};
                objUnit['name'] = dataUpdateParameters.unitName;
                objUnit['plateNumber'] = dataUpdateParameters.unitPlateNumber;
                objUnit['vin'] = dataUpdateParameters.unitVin;
                objUnit['subVehicleType'] = dataUpdateParameters.unitSubVehicleType;
                objUnit['engineType'] = dataUpdateParameters.unitEngineType;
                objUnit['companyId'] = dataUpdateParameters.unitCompanyId;
                objUnit['extraFields'] = dataUpdateParameters.unitExtraFields;
                objUnit['validateDate'] = dataUpdateParameters.unitValidateDate;
                objUnit['facturationCustomerId'] = dataUpdateParameters.unitFacturationCustomerId;
                objUnit['typeSaleId'] = dataUpdateParameters.unitTypeSale;
                objUnit['addDefaultFleet'] = true;
                objUnit['id'] = dataUpdateParameters.unitId;

                return objUnit;
            }

            $scope.updateUnitFunction = function () {
                usSpinnerService.spin('spinner-17');
                unidad.updateUnit({
                    'unidad': dataToUpdateUnit($scope.dataModalUnit),
                    'realm': realm
                }, function (response) {
                    if (response.result) {
                        $scope.showSaveParameters = true;
                        $scope.showErrorSaveParameters = false;
                        successModalOperation = true;
                    } else {
                        $scope.showSaveParameters = false;
                        $scope.showErrorSaveParameters = true;
                        successModalOperation = false;
                    }
                    usSpinnerService.stop('spinner-17');
                }, function (error) {
                    $scope.showSaveParameters = false;
                    $scope.showErrorSaveParameters = true;
                    successModalOperation = false;
                    usSpinnerService.stop('spinner-17');
                });
            };

            $scope.$watch('showModalUnit', function () {
                // solo si fue exitosa la actualizacion, se realiza un refresh del grid
                if (successModalOperation) {
                    getUnitsByCompany();
                }
            }, true);

        });
