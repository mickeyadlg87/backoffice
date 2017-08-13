angular.module('backOfficeNewapp')
        .controller('customerController', function ($scope, user, unsubscribe, $location, moment, $http, $rootScope, $window, $timeout, usSpinnerService, company, exportXls, DTOptionsBuilder, DTColumnDefBuilder) {

            var arrayData;
            var arrayType;
            var arrayPlan;
            var realm = "rslite";
            var realmBack = "backoffice";
            var limit = 0;
            var offset = 0;
            var dataExport;
            var plataformSelected;
            var successModalOperation = false;
            var arraySale;

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
            $scope.showModalModifyClient = false;
            $scope.showModalAddClient = false;
            $scope.typeReport = "clientes";
            $scope.ifReseller = false;
            $scope.resellerTrue = false;

            $scope.datosComerciales = true;
            $scope.datosEjecutivo = true;
            $scope.datosPagos = true;
            $scope.datosCliente = true;
            $scope.datosCondiciones = true;
            $scope.datosPlataforma = true;

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
                getTypeSale();
                getFunctionalityPackage();
                getCompanies(limit, offset);
            });

            $scope.$on('create', function (event, dataFiltered) {
                $scope.showModalAddClient = true;
                $scope.showSaveParameters = false;
                $scope.showErrorSaveParameters = false;
                successModalOperation = false;
                getTypeSale();
                $scope.newModalityGroup = arraySale;
            });

            function getCompanies(lim, off) {

                var dataExportObj = {};
                var objCompany = {};
                var objCompanyForGroup = {};
                var arrayCompany = new Array();
                var arrayCompanyForGroup = new Array();

                dataExport = new Array();
                arrayData = new Array();

                $scope.reportShow = false;
                usSpinnerService.spin('spinner-1');
                $rootScope.$broadcast('disableButtonSearch', true);
                $rootScope.$broadcast('disableButtonCreate', true);

                company.getCompanyList({
                    'realm': plataformSelected,
                    'limit': lim,
                    'offset': off
                }, function (data) {
                    arrayData = data;
                    if (arrayData.length >= 1) {
                        angular.forEach(arrayData, function (valueCompany, key) {
                            objCompany['id'] = valueCompany.id;
                            objCompany['alias'] = valueCompany.alias;
                            objCompany['resellerId'] = valueCompany.resellerId;
                            objCompany['resellerName'] = valueCompany.resellerName;
                            objCompany['businessName'] = valueCompany.businessName;
                            objCompany['secondaryPhone'] = valueCompany.secondaryPhone;
                            objCompany['maxUsersPerCompany'] = valueCompany.maxUsersPerCompany;
                            objCompany['email'] = valueCompany.email;
                            objCompany['maxVehicles'] = valueCompany.maxVehicles;
                            objCompany['planId'] = valueCompany.planId;
                            objCompany['weeklyReport'] = valueCompany.weeklyReport;
                            objCompany['name'] = valueCompany.name;
                            dataExportObj['Nombre'] = valueCompany.name;
                            objCompany['rut'] = valueCompany.rut;
                            dataExportObj['R.U.T'] = valueCompany.rut;
                            objCompany['phone'] = valueCompany.phone;
                            dataExportObj['Telefono'] = valueCompany.phone;
                            objCompany['address'] = valueCompany.address;
                            dataExportObj['Direccion'] = valueCompany.address;
                            objCompany['creationDate'] = valueCompany.creationDate;
                            dataExportObj['Fecha de Creacion'] = new Date(valueCompany.creationDate).toLocaleDateString();

                            objCompanyForGroup['id'] = valueCompany.id;
                            objCompanyForGroup['name'] = valueCompany.name;

                            arrayCompany.push(objCompany);
                            dataExport.push(dataExportObj);
                            arrayCompanyForGroup.push(objCompanyForGroup);

                            objCompany = {};
                            dataExportObj = {};
                            objCompanyForGroup = {};
                        });
                        $scope.companies = arrayCompany;
                        $scope.customerGroupEdit = arrayCompanyForGroup;
                        $scope.customerGroupCert = arrayCompanyForGroup;
                        $scope.reportShow = true;
                    } else {
                        $scope.reportShow = false;
                        $scope.showAletError = true;
                    }
                    usSpinnerService.stop('spinner-1');
                    $rootScope.$broadcast('disableButtonSearch', false);
                    $rootScope.$broadcast('disableButtonCreate', false);
                }, function (error) {
                    usSpinnerService.stop('spinner-1');
                    console.log("error get companies");
                    $scope.reportShow = false;
                    $rootScope.$broadcast('disableButtonSearch', false);
                    $rootScope.$broadcast('disableButtonCreate', false);
                    $scope.showAletError = true;
                });
            }

            function getTypeSale() {
                arrayType = new Array();
                arraySale = new Array();
                var objSale = {};
                unsubscribe.getGeneralState({
                    'realm': realmBack,
                    'codeName': 'TYPE_SALE'
                }, function (dta) {
                    arrayType = dta;
                    if (arrayType.length >= 1) {
                        angular.forEach(arrayType, function (val, ky) {
                            objSale['reason'] = val.descriptionState;
                            objSale['active'] = false;
                            objSale['typeSaleId'] = val.descriptionId;
                            arraySale.push(objSale);
                            objSale = {};
                        });
                    } else {
                        arraySale = [{"reason": "Sin datos"}];
                    }
                }, function (error) {
                    arraySale = [{"reason": "Sin datos"}];
                    console.log("error al obtener informacion tipo de venta");
                });
            }

            function getFunctionalityPackage() {
                arrayPlan = new Array();
                var arrayTypePlan = new Array();
                var objPaln = {};
                unsubscribe.getGeneralState({
                    'realm': realmBack,
                    'codeName': 'PACKAGE_FUNCIONALITY'
                }, function (dta) {
                    arrayPlan = dta;
                    if (arrayPlan) {
                        angular.forEach(arrayPlan, function (val, ky) {
                            objPaln['reason'] = val.descriptionState;
                            arrayTypePlan.push(objPaln);
                            objPaln = {};
                        });
                        $scope.modalidadPlan = arrayTypePlan;
                    } else {
                        $scope.modalidadPlan = "Sin Datos";
                    }
                }, function (error) {
                    $scope.modalidadPlan = "Sin Datos";
                    console.error("error al obtener informacion tipo de plan", error);
                });
            }


            //funcion separa fecha en tramos en caso de ser mayor a una semana
            function splitDate(startDate, endDate) {

                var startDateMili = startDate.getTime();
                var endDateMili = endDate.getTime();
                var oneDay = 24 * 60 * 60 * 1000;
                var daysCount = (endDateMili - startDateMili) / oneDay;
                daysCount = Math.floor(daysCount);

                //validacion si las fechas estan bien seleccionadas segun vehiculos consultados, retorna null
                if (daysCount > 31) {
                    $scope.showAletErrorMonth = true;
                    return null;
                }

                var dayMili = 86399000;
                var secondsMili = 1000;
                var sixDay = 604799000;
                var arraySectionDate = new Array();

                if (endDateMili - startDateMili > sixDay) {
                    var objAuxSectionDate = {};
                    var countWeek = Math.floor((endDateMili - startDateMili) / sixDay);
                    var startDateSection = startDateMili;
                    var endDateSection;
                    for (i = 0; i < countWeek; i++) {
                        if (i > 0) {
                            startDateSection = (endDateSection + secondsMili);
                        }
                        endDateSection = startDateSection + sixDay;
                        objAuxSectionDate['start'] = startDateSection;
                        objAuxSectionDate['end'] = endDateSection;
                        arraySectionDate.push(objAuxSectionDate);
                        objAuxSectionDate = {}
                    }
                    var modDate = (endDateMili - startDateMili) % sixDay;
                    objAuxSectionDate['start'] = (endDateSection + secondsMili);
                    objAuxSectionDate['end'] = (endDateSection + secondsMili + modDate);
                    arraySectionDate.push(objAuxSectionDate);
                } else {
                    objAuxSectionDate = {};
                    objAuxSectionDate['start'] = startDateMili;
                    objAuxSectionDate['end'] = endDateMili;
                    arraySectionDate.push(objAuxSectionDate);
                }
                return arraySectionDate;
            }


            //Obtener fecha ayer Hora inicio
            function getYesterdayStart(date) {

                date.setDate(date.getDate() - 1);
                date.setHours(0);
                date.setMinutes(0);
                date.setSeconds(0);

                return date;
            }

            //Obtener fecha ayer Hora final
            function getYesterdayEnd(date) {

                date.setDate(date.getDate() - 1);
                date.setHours(23);
                date.setMinutes(59);
                date.setSeconds(59);

                return date;
            }

            //Obtiene inicio de la semana
            function getWeekNowStart(date) {
                var day = date.getDay() || 7;
                if (day !== 1)
                    date.setHours(-24 * (day - 1));

                date.setHours(0);
                date.setMinutes(0);
                date.setSeconds(0);

                return date;
            }

            //Obtiene la fecha actual
            function getWeekNowEnd(date) {
                return date;
            }


            //Obtiene fecha inicio semana anterior
            function getLastWeekStart(date) {
                var day = date.getDay() || 7;
                if (day !== 1)
                    date.setHours(-24 * (day - 1));
                date.setMinutes(0);
                date.setSeconds(0);

                date.setHours(-24 * (7));
                return date;
            }

            //Obtiene fecha fin semana anterior
            function getLastWeekEnd(date) {
                var day = date.getDay() || 7;
                if (day !== 1)
                    date.setHours(-24 * (day - 1));

                date.setHours(-24 * (1));
                date.setHours(23);
                date.setMinutes(59);
                date.setSeconds(59);
                return date;
            }

            //Obtener inicio mes actual
            function getMonthNowStart(date) {
                date.setDate(1);
                date.setHours(0);
                date.setMinutes(0);
                date.setSeconds(0);

                return date;
            }

            //Obtener Mes anterior inicio
            function getLastDayMonthStart(date) {
                var firstDayLastMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
                return firstDayLastMonth;
            }

            //Obtiene mes anterior ultimo dia
            function getLastDayMonthEnd(date) {
                var lastDayLastMonth = new Date(date.getFullYear(), date.getMonth(), 0)
                lastDayLastMonth.setHours(23);
                lastDayLastMonth.setMinutes(59);
                lastDayLastMonth.setSeconds(59);
                return lastDayLastMonth;
            }

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
            $scope.aletErrorCompany = [{type: 'danger', msg: 'No se pudieron obtener las empresas para asignar el reseller'}];

            $scope.closeAlertError = function (index) {
                $scope.showAletError = false;
                $scope.showAletErrorCompany = false;
            };

            $scope.closeAlertSendEmail = function (index) {
                $scope.showAlertSendEmail = false;
                $scope.showAlertExportOk = false;
            };

            $scope.closeAlert = function (index) {
                $scope.showAletErrorWeek = false;
                $scope.showAletErrorMonth = false;
                $scope.showAletErrorExport = false;
                $scope.showAlertErrorDateSelected = false;
            };

            $scope.closeAlertParameters = function (index) {
                $scope.showSaveParameters = false;
                $scope.showErrorSaveParameters = false;
            };

            //funcion que genera exportar reportes
            $scope.generateReport = function (type) {
                $scope.showAlertExportOk = false;
                $scope.showAlertSendEmail = false;
                $scope.showAletErrorExport = false;
                var objHeader = {};
                objHeader['Plataforma'] = plataformSelected;
                objHeader['Fecha Generacion'] = new Date().toLocaleString();

                exportXls.postExportXls({
                    'title': "Reporte de Clientes " + plataformSelected,
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


            $scope.showCalenderized = function () {
                console.log("showCalenderized");
                $scope.showModalCalenderized = true;
            };

            //llama a directiva sendMail para mostrar modal
            $scope.callModal = function () {
                $rootScope.$broadcast('callModal');
                $scope.showModal = true;
            };

            $scope.editCompany = function (client) {
                var objDataBackOff = {};
                var objDataPlatform = {};
                var arrayNewTypeSale = new Array();
                var objNewCustomer = {};
                $scope.dataModal = {};
                $scope.showSaveParameters = false;
                $scope.showErrorSaveParameters = false;
                successModalOperation = false;

                // Info proveniente de la plataforma seleccionada
                objDataPlatform.customerExternalId = client.id;
                objDataPlatform.customerName = client.name;
                //Desde el servicio
                objDataPlatform.customerAlias = client.alias;
                objDataPlatform.rut = client.rut;
                objDataPlatform.businessName = client.businessName;
                objDataPlatform.address = client.address;
                objDataPlatform.companySecondaryPhone = client.secondaryPhone;
                objDataPlatform.tradeContactPhone = client.phone;
                objDataPlatform.companyMaxUsers = client.maxUsersPerCompany;
                objDataPlatform.companyResellerId = client.resellerId;
                objDataPlatform.tradeContactMail = client.email;
                objDataPlatform.companyMaxVehicles = client.maxVehicles;
                objDataPlatform.companyPlanId = client.planId;
                objDataPlatform.companyWeeklyReport = client.weeklyReport;
                if (client.resellerId != null) {
                    $scope.resellerTrue = true;
                    objDataPlatform.chekReseller = true;
                    objDataPlatform.companyReseller = {'name': client.resellerName, 'id': client.resellerId};
                } else {
                    $scope.resellerTrue = false;
                    objDataPlatform.chekReseller = false;
                }
                objDataPlatform.resellerId = client.resellerId;
                objDataPlatform.resellerName = client.resellerName;
                objDataPlatform.planId = client.planId;

                company.getCustomerBackoffice({
                    'plataform': plataformSelected,
                    'externalCustomerId': client.id
                }, function (response) {
                    objDataBackOff = response;
                    if (objDataBackOff.id) {
                        for (var i = 0; i < arraySale.length; i++) {
                            if (objDataBackOff.typeSaleList.length > 0) {
                                for (var j = 0; j < objDataBackOff.typeSaleList.length; j++) {
                                    objNewCustomer.reason = arraySale[i].reason;
                                    objNewCustomer.typeSaleId = arraySale[i].typeSaleId;
                                    if (arraySale[i].typeSaleId == objDataBackOff.typeSaleList[j].typeSaleId) {
                                        objNewCustomer.active = true;
                                        objNewCustomer.rate = objDataBackOff.typeSaleList[j].rate;
                                        break;
                                    } else {
                                        objNewCustomer.active = false;
                                    }
                                }
                            } else {
                                objNewCustomer.reason = arraySale[i].reason;
                                objNewCustomer.typeSaleId = arraySale[i].typeSaleId;
                                objNewCustomer.active = false;
                            }
                            arrayNewTypeSale.push(objNewCustomer);
                            objNewCustomer = {};
                        }
                        $scope.modalidadGroup = arrayNewTypeSale;
                        $scope.dataModal = angular.extend(objDataPlatform, objDataBackOff);
                        $scope.dataModal.contractDateRaw = new Date(objDataBackOff.contractDate);
                    } else {
                        getTypeSale();
                        $scope.modalidadGroup = arraySale;
                        $scope.dataModal = angular.extend(objDataPlatform, {"companyWithoutBackoffice": true});
                    }
                    $scope.showModalModifyClient = true;
                }, function (error) {
                    console.error("error obteniendo company backoffice ", error);
                });

            };

            $scope.changeStateEdit = function () {
                if ($scope.resellerTrue) {
                    $scope.resellerTrue = false;
                } else {
                    $scope.resellerTrue = true;
                }
            };

            // accion ocurrida al cerrar el modal de actualizacion de cliente
            $scope.$watch('showModalModifyClient', function () {
                // solo si fue exitosa la actualizacion, se realiza un refresh del grid
                if (successModalOperation) {
                    getCompanies(limit, offset);
                }
            }, true);

            // accion ocurrida al cerrar el modal de creacion de cliente
            $scope.$watch('showModalAddClient', function () {
                // solo si fue exitosa la actualizacion, se realiza un refresh del grid
                // y se resetea el objeto q almacena la informacion
                if (successModalOperation) {
                    $scope.dataModalInsert = {};
                    $scope.dataModalInsert.weeklyReport = true;
                    getCompanies(limit, offset);
                }
            }, true);

            $scope.changeState = function () {
                if ($scope.ifReseller) {
                    $scope.ifReseller = false;
                    $scope.dataModalInsert.resellerId = null;
                } else {
                    $scope.ifReseller = true;
                }
            };

            $scope.insertRowCompany = function () {
                usSpinnerService.spin('spinner-3');
                var fechaContratoInsert = $scope.dataModalInsert.contractDateRaw;
                $scope.dataModalInsert.contractDate = new Date(fechaContratoInsert).getTime();
                if ($scope.dataModalInsert.chek) {
                    var reseller = $scope.dataModalInsert.companyResellerSelected.id;
                    $scope.dataModalInsert.resellerId = reseller;
                } else {
                    $scope.dataModalInsert.resellerId = null;
                }
                $scope.dataModalInsert.typeSaleList = $scope.newModalityGroup;

                var arrayFuncionPackage = {};
                user.getProfilesForAsigned({
                    'realm': realmBack
                }, function (response) {
                    if (response.length >= 1) {
                        arrayFuncionPackage = response[2];
                    }
                    if ($scope.ifReseller) {
                        $scope.dataModalInsert.reseller = 1;
                    } else {
                        $scope.dataModalInsert.reseller = 0;
                    }
                    $scope.dataModalInsert.functionalPackage = arrayFuncionPackage;

                    company.insertNewCompany({
                        'company': $scope.dataModalInsert,
                        'realm': plataformSelected
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
                        usSpinnerService.stop('spinner-3');
                    }, function (error) {
                        $scope.showSaveParameters = false;
                        $scope.showErrorSaveParameters = true;
                        successModalOperation = false;
                        console.log("error agregando company");
                        usSpinnerService.stop('spinner-3');
                    });
                }, function (error) {
                    console.error("error get paquete funcional", error);
                });

            };

            $scope.updateRowCompany = function () {
                usSpinnerService.spin('spinner-2');
                var fechaContrato = $scope.dataModal.contractDateRaw;
                $scope.dataModal.contractDate = new Date(fechaContrato).getTime();
                if ($scope.dataModal.chekReseller) {
                    var resellerUpdate = $scope.dataModal.companyReseller.id;
                    $scope.dataModal.resellerId = resellerUpdate;
                } else {
                    $scope.dataModal.resellerId = 1;
                }

                $scope.dataModal.typeSaleList = $scope.modalidadGroup;

                company.updateCompanySelected({
                    'company': $scope.dataModal,
                    'realm': plataformSelected
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
                    usSpinnerService.stop('spinner-2');
                }, function (error) {
                    $scope.showSaveParameters = false;
                    $scope.showErrorSaveParameters = true;
                    successModalOperation = false;
                    console.log("error editando company");
                    usSpinnerService.stop('spinner-2');
                });
            };

            $scope.hide = function (content) {
                switch (content) {
                    case 'datosComerciales':
                        $scope.datosComerciales = !$scope.datosComerciales;
                        break;
                    case 'datosEjecutivo':
                        $scope.datosEjecutivo = !$scope.datosEjecutivo;
                        break;
                    case 'datosPagos':
                        $scope.datosPagos = !$scope.datosPagos;
                        break;
                    case 'datosCliente':
                        $scope.datosCliente = !$scope.datosCliente;
                        break;
                    case 'datosCondiciones':
                        $scope.datosCondiciones = !$scope.datosCondiciones;
                        break;
                    case 'datosPlataforma':
                        $scope.datosPlataforma = !$scope.datosPlataforma;
                        break;
                }
            };

        });