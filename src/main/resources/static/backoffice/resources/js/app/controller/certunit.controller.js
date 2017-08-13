'use strict';

angular.module('backOfficeNewapp')
        .controller('certUnitController', function ($scope, SweetAlert, $timeout, unsubscribe, $rootScope, $localStorage, $window, usSpinnerService, company, dispositivo, unidad, exportXls, DTOptionsBuilder, DTColumnDefBuilder) {

            var arrayData;
            var arrayDataCert;
            var arrayType;
            var realm = "rslite";
            var realmBack = "backoffice";
            var dataExport;
            var dataExportObj;
            var plataformSelected;
            var mid = "";
            var defaultValue = 1;
            var infoForCertified = {};

            $scope.typeReport = "Certificar Unidad";
            $scope.realm = realm;
            $scope.showRequired = true;
            $scope.showModal = false;
            $scope.limitCustomerSearch = 1000;
            $scope.showAlertExportOk = false;
            $scope.showAletErrorExport = false;
            $scope.showSaveParameters = false;
            $scope.showErrorSaveParameters = false;
            $scope.showAletErrorCompany = false;
            $scope.showErrorSaveInfo = false;

            //se mostrara "filtro de reporte"
            $scope.filterReport = true;

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
                DTColumnDefBuilder.newColumnDef(5).notSortable() 
            ];

            //Funcion principal que recibe informacion para llamar servicio y generar reportes-.
            $scope.$on('search', function (event, data, rangeDate) {
                plataformSelected = data.plataform;
                getUnitForCert();
                getTypeSale();
            });

            function getUnitForCert() {

                arrayData = new Array();
                var objUnit = {};
                var objexport = {};
                var arrayUnit = new Array();
                dataExportObj = new Array();
                dataExport = new Array();


                $scope.reportShow = false;
                usSpinnerService.spin('spinner-1');
                $rootScope.$broadcast('disableButtonSearch', true);
                $rootScope.$broadcast('disableButtonCreate', true);

                /**
                 * Obtiene los primeros cien datos del reporte de facturacion-.
                 */
                unidad.getUnitListForCert({
                    'realm': plataformSelected
                }, function (data) {
                    arrayData = data;
                    if (arrayData.length >= 1) {
                        angular.forEach(arrayData, function (value, key) {
                            objUnit['_m'] = value._m;
                            objUnit['id'] = value.id;
                            objUnit['creationDate'] = value.creationDate;
                            objUnit['deviceTypeId'] = value.deviceTypeId;
                            objUnit['deviceTypeName'] = value.deviceTypeName;
                            objUnit['lastActivityDate'] = value.lastActivityDate;
                            objUnit['name'] = value.name;
                            objUnit['plateNumber'] = value.plateNumber;
                            objUnit['validateDeviceDate'] = value.validateDeviceDate;

                            objexport['Imei'] = value._m;
                            objexport['Fecha Creacion'] = new Date(value.creationDate).toLocaleDateString();
                            objexport['Tipo dispositivo'] = value.deviceTypeName == null ? "S/I" : value.deviceTypeName;
                            objexport['Patente'] = value.plateNumber == null ? "S/I" : value.plateNumber;
                            objexport['Fecha Validacion'] = new Date(value.validateDeviceDate).toLocaleDateString();

                            arrayUnit.push(objUnit);
                            dataExport.push(objexport);

                            objUnit = {};
                            objexport = {};
                        });

                        $scope.unitCert = arrayUnit;
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
                    console.log("error get unit for cetificate");
                    $scope.reportShow = false;
                    $rootScope.$broadcast('disableButtonSearch', false);
                    $rootScope.$broadcast('disableButtonCreate', true);
                    $scope.showAletError = true;
                });

            }
            
            function getTypeSale() {
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

            //funcion que genera exportar reportes
            $scope.generateReport = function (type) {

                $scope.showAlertExportOk = false;
                $scope.showAletErrorExport = false;
                var objHeader = {};
                objHeader['Fecha Generacion'] = new Date().toLocaleString();

                exportXls.postExportXls({
                    'title': "Reporte de Unidades sin Certificar" + plataformSelected,
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

            $scope.alertsExportOk = [{type: 'success', msg: 'El reporte fue exportado exitosamente'}];
            $scope.alertsExport = [{type: 'danger', msg: 'Hubo problemas al exportar, por favor inténtelo nuevamente'}];
            $scope.alertSaveParameters = [{type: 'success', msg: 'Los parámetros han sido modificados correctamente'}];
            $scope.alertErrorSaveParameters = [{type: 'danger', msg: 'Ha ocurrido un error al intentar modificar los parámetros, favor volver a intentar'}];
            $scope.aletErrorCompany = [{type: 'danger', msg: 'No se pudieron obtener las empresas para asignar unidad'}];
            $scope.aletErrorSaveInfo = [{type: 'danger', msg: 'No se pudo actualizar '}];

            $scope.closeAlertError = function (index) {
                $scope.showAlertExportOk = false;
                $scope.showAletErrorExport = false;
                $scope.showSaveParameters = false;
                $scope.showErrorSaveParameters = false;
                $scope.showErrorSaveInfo = false;
                $scope.showAletErrorCompany = false;
            };

            $scope.certUnit = function (unitDataCert) {
                $scope.selectCompany = false;
                var arrayCert = new Array();
                var objUnit = {};
                arrayDataCert = new Array();
                $scope.dataModalCertUnit = {};
                
                usSpinnerService.spin('spinner-6');
                
                $scope.showSaveParameters = false;
                $scope.showAletErrorEvents = false;
                $scope.showAletErrorAccessories = false;
                $scope.showErrorSaveParameters = false;
                $scope.eventCert = new Array();
                $scope.accessoriesCert = new Array();
                $scope.eventCertTrue = true;
                $scope.eventTrue = false;
                
                $scope.dataModalCertUnit.id = unitDataCert.id;
                $scope.dataModalCertUnit.name = unitDataCert.name;
                $scope.dataModalCertUnit.plateNumber = unitDataCert.plateNumber;
                $scope.dataModalCertUnit.companySelected = undefined;
                $scope.dataModalCertUnit.unitTypeSale = 16; //-> no especificado
                $scope.dataModalCertUnit.companyFactSelected = undefined;
                $scope.dataModalCertUnit.vin = null;
                $scope.dataModalCertUnit.deviceImei = unitDataCert._m;
                $scope.dataModalCertUnit.deviceName = unitDataCert.deviceTypeName;
                $scope.dataModalCertUnit.deviceId = unitDataCert.deviceTypeId;
                $scope.dataModalCertUnit.creationDate = unitDataCert.creationDate;
                $scope.dataModalCertUnit.lastActivityDate = unitDataCert.lastActivityDate;
                $scope.dataModalCertUnit.validateDeviceDate = unitDataCert.validateDeviceDate;
                
                mid = unitDataCert._m;
                var deviceIdType = unitDataCert.deviceTypeId;
                
                /**
                 * Llena eventos por dispositivos
                 */
                unidad.getAccessoriesAndEventForValidate({
                    'realm': realmBack,
                    'deviceTypeId': deviceIdType,
                    'mid': mid
                }, function (data) {
                    arrayDataCert = data;
                    if (arrayDataCert.length >= 1) {
                        angular.forEach(arrayDataCert, function (unit, key) {
                            objUnit['eventId'] = unit.eventId;
                            objUnit['eventName'] = unit.eventName;
                            objUnit['accesoryName'] = unit.accesoryName;
                            objUnit['enabled'] = false;
                            objUnit['validation'] = "";

                            arrayCert.push(objUnit);
                            objUnit = {};
                        });
                        $scope.eventCert = arrayCert;
                        $scope.eventTrue = true;
                    } else {
                        $scope.showAletErrorEvents = true;
                    }
                    usSpinnerService.stop('spinner-6');
                }, function (error) {
                    usSpinnerService.stop('spinner-6');
                    console.log("error get events and accessories");
                    $scope.showAletErrorEvents = true;
                });

                $scope.showModalCertUnit = true;
            };

            /**
             * @param {type} unitCert valida eventos para la unidad
             * @returns {undefined}
             */
            $scope.validate = function (unitCert){
                $scope.selectCompany = false;
                var validateUnit = {};
                var arrayEventCert = $scope.eventCert;
                validateUnit.arrayEvent = $scope.eventCert;
                validateUnit.mid = $scope.dataModalCertUnit;
                
                dispositivo.validateEvents({
                    'contentCertEvent': validateUnit
                }, function (response) {
                    if (response.result) {
                        angular.forEach(arrayEventCert, function(value, key){
                            value.enabled = true;
//                            $scope.eventCertTrue = false;
                            value.validation = "Evento Validado Correctamente";
                            $scope.selectCompany = true;
                        });
                        getCompanyForCert();
                    }else{ 
                        angular.forEach(arrayEventCert, function(value2, key2){
                            var eventToCertificated = value2.eventId;
                            if (response.arrayEventFounded != 0){
                                angular.forEach(response.arrayEventFounded, function(value1, key1){
                                    var foundedEventIdResponse = value1.foundedEventId;
                                        if(eventToCertificated == foundedEventIdResponse){
                                            value2.enabled = true;
                                            $scope.eventCertTrue = true;
                                            value2.validation = "Evento Validado Correctamente";
                                            $scope.selectCompany = false;
                                        }else {
                                            value2.enabled = false;
                                            $scope.eventCertTrue = true;
                                            value2.validation = "Evento No Validado";
                                            $scope.selectCompany = false;
                                        };
                                });
                            } else {
                                value2.enabled = false;
                                $scope.eventCertTrue = true;
                                value2.validation = "Evento No Validado";
                            };
                        });
                    }
                }, function (error) {
                    $scope.showAletErrorEvents = true;
                    console.log("error validate Events");
                });
            };
            
            function getCompanyForCert () {
                var arrayCompany = new Array();
                var objCompany = {};
                var empresas = new Array();
                $scope.showAletErrorCompany = false;
                
                company.getCompanyList({
                    'realm': realm,
                    'limit': 1,
                    'offset': 0,
                    'sortBy': 'name'
                }, function (rawData) {
                    arrayCompany = rawData;
                    if (arrayCompany.length >= 1) {
                        angular.forEach(arrayCompany, function (valueCompany, key) {
                            objCompany['id'] = valueCompany.id;
                            objCompany['name'] = valueCompany.name;
                            empresas.push(objCompany);
                            objCompany = {};
                        });
                        $scope.customerGroupCert = empresas;
                        $scope.customerFactGroupCert = empresas;
                    } else {
                        $scope.showAletErrorCompany = true;
                    }
                    usSpinnerService.stop('spinner-1');
                }, function (error) {
                    usSpinnerService.stop('spinner-1');
                    console.log("error get companies for combobox");
                    $scope.showAletErrorCompany = true;
                });
            }
            
            /**
             * Retorna valores a actualizar
             * @returns {certunit_controller_L4.dataToCert.objCertUnit}
             */
            function dataToCert () {
                var objCertUnit = {};
                
                objCertUnit['name'] = $scope.dataModalCertUnit.name;
                objCertUnit['plateNumber'] = $scope.dataModalCertUnit.plateNumber;
                objCertUnit['subVehicleType'] = defaultValue;
                objCertUnit['engineType'] = defaultValue;
                objCertUnit['companyId'] = $scope.dataModalCertUnit.companySelected.id;
                objCertUnit['extraFields'] = null;
                objCertUnit['validate'] = defaultValue;
                objCertUnit['vin'] = $scope.dataModalCertUnit.vin;
                objCertUnit['id'] = $scope.dataModalCertUnit.id;
                objCertUnit['validateDate'] = new Date().getTime();
                objCertUnit['typeSaleId'] = $scope.dataModalCertUnit.unitTypeSale;
                objCertUnit['facturationCustomerId'] = $scope.dataModalCertUnit.companyFactSelected == undefined ? null : $scope.dataModalCertUnit.companyFactSelected.id;
                objCertUnit['addDefaultFleet'] = true;
                
                return objCertUnit;
            };
            
            /**
             * validacion texto introducido en 
             * el filtro de los select de empresa
             * @param {type} customerTyped
             * @returns {undefined}
             */
            $scope.checkCustomer = function (customerTyped) {
                if (customerTyped.length >= 1) {
                    $scope.limitCustomerSearch = 100;
                } else {
                    $scope.limitCustomerSearch = 5;
                }
            };
            
            /**
             * certifica la unidad
             * @returns {undefined}
             */
            $scope.certificate = function (){
                SweetAlert.swal({
                    title: "Esta Seguro?",
                    text: "Esta Unidad sera Certificada",
                    type: "info",
                    showCancelButton: true,
                    confirmButtonColor: "#5cc25a",
                    confirmButtonText: "Certificar !",
                    cancelButtonColor: '#F00E0E',
                    cancelButtonText: "Cancelar",
                    closeOnConfirm: false,
                    closeOnCancel: false
                }, function (isConfirm) {
                    if (isConfirm) {
                        insertInfoCertUnit();
                    } else {
                        SweetAlert.swal('Cancelado!', 'La unidad no fue certificada', 'error');
                    }
                });
            };
            
            function insertInfoCertUnit() {
                infoForCertified.realmTrue = plataformSelected;
                infoForCertified.unitId = $scope.dataModalCertUnit.id;
                infoForCertified.username = $localStorage.user;
                infoForCertified.imei = $scope.dataModalCertUnit.deviceImei;
                infoForCertified.actionDate = new Date().getTime();
                infoForCertified.note = null;
                infoForCertified.creationUnitDate = $scope.dataModalCertUnit.creationDate;
                infoForCertified.lastActivityDate = $scope.dataModalCertUnit.lastActivityDate;
                infoForCertified.devicetypeId = $scope.dataModalCertUnit.deviceId;
                infoForCertified.devicetypeName = $scope.dataModalCertUnit.deviceName;
                infoForCertified.plateNumber = $scope.dataModalCertUnit.plateNumber;
                infoForCertified.unitName = $scope.dataModalCertUnit.name;
                infoForCertified.vin = $scope.dataModalCertUnit.vin;
                infoForCertified.companyId = $scope.dataModalCertUnit.companySelected.id;
                infoForCertified.companyName = $scope.dataModalCertUnit.companySelected.name;
                infoForCertified.deviceValidationDate = $scope.dataModalCertUnit.validateDeviceDate;
                infoForCertified.typeSale = $scope.dataModalCertUnit.unitTypeSale;
                infoForCertified.companyFactSelected = $scope.dataModalCertUnit.companyFactSelected == undefined ? null : $scope.dataModalCertUnit.companyFactSelected.id;
                infoForCertified.companyFactSelectedName = $scope.dataModalCertUnit.companyFactSelected == undefined ? null : $scope.dataModalCertUnit.companyFactSelected.name;
                unidad.insertInfoCertUnit({
                    'unidad' : infoForCertified,
                    'realm' : realmBack
                }, function (response) {
                    if (response.result) {
                    unidad.updateUnit({
                            'unidad': dataToCert(),
                            'realm': realm
                        }, function (response) {
                            if (response.result) {
                                $scope.showSaveParameters = true;
                                SweetAlert.swal({
                                    title: "Listo!",
                                    text: "La unidad fue certificada exitosamente",
                                    type: "success",
                                    showCancelButton: false,
                                    confirmButtonColor: "#5cc25a",
                                    confirmButtonText: "Terminar"
                                }, function (isConfirm) {
                                    if (isConfirm) {
                                        $scope.showModalCertUnit = false;
                                        getUnitForCert();
                                    }
                                });
                            } else {
                                $scope.showSaveParameters = false;
                                $scope.showErrorSaveParameters = true;
                                SweetAlert.swal('Error!', 'La unidad no fue certificada', 'error');
                            }
                        }, function (error) {
                            $scope.showSaveParameters = false;
                            $scope.showErrorSaveParameters = true;
                            SweetAlert.swal('Error!', 'La unidad no fue certificada', 'error');
                        });
                    } else {
                        $scope.showErrorSaveInfo = true;
                        SweetAlert.swal('Error!', 'La unidad no fue certificada', 'error');
                    }
                    usSpinnerService.stop('spinner-6');
                }, function (error) {
                    $scope.showErrorSaveInfo = true;
                    SweetAlert.swal('Error!', 'La unidad no fue certificada', 'error');
                });
            };
            
        });


