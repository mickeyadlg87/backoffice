angular.module('backOfficeNewapp')
        .directive('modalCalenderized', function (user, vehicle, $location, $rootScope, usSpinnerService, splitDate, calenderized) {
            return {
                scope: {
                    arrayData: '=data',
                    typeReport: '=report',
                    arrayVehicles: '=vehicles',
                    arrayEvents: '=events'
                },
                templateUrl: '/backoffice/resources/js/app/directives/layout/viewCalenderized.html',
                restrict: 'E',
                link: function (scope, elem, attrs) {
                    var realm = $location.search().realm;
                    scope.$watch('arrayData', function ()
                    {
                        chargeGroup()
                    }, true);
                    scope.dataCalenderized = {};
                    scope.dataCalenderized.parameters = {};

                    // Carga de data Grupos en vista
                    function chargeGroup() {

                        var arrayGroup = new Array();
                        var objGroup = {};
                        angular.forEach(scope.arrayData, function (valueFleet, key) {
                            objGroup['idGroup'] = key;
                            objGroup['nameGroup'] = valueFleet[0][0];
                            arrayGroup.push(objGroup);

                            objGroup = {};
                        });
                        scope.groupsOption = arrayGroup;
                    }

                    // Función ejecutada al seleccionar un grupo, carga los
                    // móviles de ese grupo
                    scope.changeGroup = function (group) {

                        arrayVehicle = new Array();
                        var objVehicle = {};
                        scope.disableVehicles = false;

                        objVehicle['idVehicle'] = 0;
                        objVehicle['nameVehicle'] = "-- Todos los Móviles --";

                        arrayVehicle.push(objVehicle);
                        objVehicle = {};
                        angular.forEach(scope.arrayData[group], function (value, key) {
                            objVehicle['idVehicle'] = value[1];
                            objVehicle['nameVehicle'] = value[2];

                            arrayVehicle.push(objVehicle);
                            objVehicle = {};
                        });

                        scope.vehicle = arrayVehicle;
                        scope.dataCalenderized.vehicleSelected = scope.vehicle[0];
                    }

                    //Opciones de rango de fecha, select
                    scope.dates = [{
                            name: 'Personalizada',
                            value: 0
                        }, {
                            name: 'Ayer',
                            value: 1
                        }, {
                            name: 'Semana Actual',
                            value: 2
                        }, {
                            name: 'Semana Anterior',
                            value: 3
                        }, {
                            name: 'Mes Actual',
                            value: 4
                        }, {
                            name: 'Mes Anterior',
                            value: 5
                        }];

                    scope.daysSend = [{
                            name: 'Por única vez',
                            value: 0
                        }, {
                            name: 'Diaramente',
                            value: 1
                        }, {
                            name: 'Lunes a Viernes',
                            value: 2
                        }, {
                            name: 'Todos los días Lunes',
                            value: 3
                        }, {
                            name: 'Los días 1 de cada mes',
                            value: 4
                        }, {
                            name: 'Los días 16 de cada mes',
                            value: 5
                        }];

                    //carga los select de horas de envío
                    var objAux;
                    var arrayHoursSend = new Array();
                    for (i = 0; i < 24; i++) {
                        objAux = {};
                        objAux['value'] = i;
                        if (i < 10) {
                            objAux['name'] = "0" + i;
                        } else {
                            objAux['name'] = i;
                        }
                        arrayHoursSend.push(objAux);
                    }

                    //guardar calendarizado en bd
                    scope.createCalenderized = function (dataCalenderized) {
                        usSpinnerService.spin('spinner-1');

                        switch (dataCalenderized.rangeDate) {
                            case 0:
                                // personalizada
                                startDate = $("input#inputFrom").datetimepicker("getDate");
                                endDate = $("input#inputTo").datetimepicker("getDate");
                                break;
                            case 1:
                                // ayer
                                startDate = splitDate.getYesterdayStart(new Date());
                                endDate = splitDate.getYesterdayEnd(new Date());
                                break;
                            case 2:
                                // semana actual
                                startDate = splitDate.getWeekNowStart(new Date());
                                endDate = splitDate.getWeekNowEnd(new Date());
                                break;
                            case 3:
                                // semana anterior
                                startDate = splitDate.getLastWeekStart(new Date());
                                endDate = splitDate.getLastWeekEnd(new Date());
                                break;
                            case 4:
                                // mes actual
                                startDate = splitDate.getMonthNowStart(new Date());
                                endDate = splitDate.getWeekNowEnd(new Date());
                                break;
                            case 5:
                                // mes anterior
                                startDate = splitDate.getLastDayMonthStart(new Date());
                                endDate = splitDate.getLastDayMonthEnd(new Date());
                                break;
                        }

                        var date = [startDate, endDate];
                        initPeriod = startDate;
                        endPeriod = endDate;

                        if (initPeriod >= endPeriod) {
                            $scope.showAlertErrorDateSelected = true;
                            return null;
                        }

                        if (dataCalenderized.rangeDate != 0) {
                            $("input#inputFromCalenderized").datetimepicker("setDate", date[0]);
                            $("input#inputToCalenderized").datetimepicker("setDate", date[1]);
                        }

                        //obtiene vehiculos para enviar a servicio
                        var arrayVehicles = new Array();
                        var vehicles = {};
                        if (dataCalenderized.vehicleSelected.idVehicle == 0) {
                            //tomar todos los vehiculos
                            angular.forEach(scope.vehicle, function (value, key) {
                                if (value.idVehicle != 0) {
                                    vehicles['_m'] = value.idVehicle;
                                    vehicles['realm'] = realm;
                                    arrayVehicles.push(vehicles);

                                    vehicles = {};
                                }
                            });
                        } else {
                            vehicles['_m'] = dataCalenderized.vehicleSelected.idVehicle;
                            vehicles['realm'] = realm;
                            arrayVehicles.push(vehicles);
                        }
                        calenderized.postSaveCalenderized({
                            'vehicles': arrayVehicles,
                            'from': initPeriod.getTime(),
                            "to": endPeriod.getTime(),
                            "realm": realm,
                            "daysSend": dataCalenderized.daysSend,
                            "emails": dataCalenderized.emails,
                            "group": dataCalenderized.group,
                            "hoursSend": dataCalenderized.hoursSend,
                            "inputToLimit": new Date(dataCalenderized.inputToLimit),
                            "parameters": dataCalenderized.parameters,
                        }, function (data) {
                            usSpinnerService.stop('spinner-1');
                            scope.showAlertSaveCalenderizedError = true;
                            scope.showAlertErrorSaveCalenderizedError = false;

                        }, function (error) {
                            usSpinnerService.stop('spinner-1');
                            $scope.showAlertSaveCalenderizedError = false;
                            $scope.showAlertErrorSaveCalenderizedError = true;
                        });
                    }

                    scope.closeAlertSaveCalenderizedError = function (index) {
                        scope.showAlertSaveCalenderizedError = false;
                        scope.showAlertErrorSaveCalenderizedError = false;
                    }

                    //configuracion datepicker por default
                    scope.hoursSend = arrayHoursSend;
                    scope.dataCalenderized.hoursSend = scope.hoursSend[7].value;
                    scope.dataCalenderized.daysSend = scope.daysSend[0].value;
                    scope.dataCalenderized.rangeDate = scope.dates[2].value;
                    scope.dateOptions = datePickerDefaultOptions;
                    $("input#inputFromCalenderized").datetimepicker("setDate", getToday().init);
                    $("input#inputToCalenderized").datetimepicker("setDate", getToday().end);
                    $('input#inputToLimit').datepicker({dateFormat: "mm/dd/yy", changeMonth: true,
                        changeYear: true, yearRange: '1900:2020', defaultDate: ''
                    });
                    scope.dataCalenderized.inputToLimit = null;


                    //parse data default
                    scope.datePickerFrom = getToday().init;
                    scope.datePickerTo = getToday().end;
                    if (scope.typeReport == "outsideHours") {

                        var arrayHoursWorkday = new Array();
                        //carga los select de rango horario laboral
                        if (scope.typeReport == "outsideHours") {
                            var objAux;
                            for (i = 0; i < 24; i++) {
                                objAux = {};
                                objAux['value'] = i;
                                if (i < 10) {
                                    objAux['name'] = "0" + i + " horas";
                                } else {
                                    objAux['name'] = i + " horas";
                                }
                                arrayHoursWorkday.push(objAux);
                            }
                        }
                        scope.hoursWorkday = arrayHoursWorkday;
                        scope.dataCalenderized.parameters.initWorkday = scope.hoursWorkday[8];
                        scope.dataCalenderized.parameters.endWorkday = scope.hoursWorkday[18];
                    } else if (scope.typeReport == "excessSpeed") {
                        scope.dataCalenderized.parameters.speedMax = 100;
                    } else if (scope.typeReport == "stateVehicle") {
                        //Se ingresan opciones de Horas de Inactividad en:
                        var objTypeInactivity = {};
                        var arrayTypeInactivity = new Array();
                        objTypeInactivity['value'] = 1;
                        objTypeInactivity['nameType'] = "Último Evento Registrado";
                        arrayTypeInactivity.push(objTypeInactivity);

                        objTypeInactivity = {};
                        objTypeInactivity['value'] = 0;
                        objTypeInactivity['nameType'] = "Última Actividad";
                        arrayTypeInactivity.push(objTypeInactivity);

                        scope.typeInactivity = arrayTypeInactivity;
                        scope.dataCalenderized.parameters.typeInactivity = scope.typeInactivity[0];
                    } else if (scope.typeReport == "listEvent") {
                        scope.$watch('arrayEvents', function ()
                        {
                            scope.dataCalenderized.parameters.arrayEvents = scope.arrayEvents;
                        }, true);
                    }

                    scope.alertSaveCalenderized = [{type: 'success', msg: 'El calendarizado fue guardado exitosamente'}];
                    scope.alertErrorSaveCalenderized = [{type: 'danger', msg: 'Ocurrio un problema al guardar el calendarizado, por favor inténtelo nuevamente'}];

                    scope.localLang = {
                        selectAll: "Seleccionar Todos",
                        selectNone: "Sin Seleccion",
                        reset: "Resetear",
                        search: "Escriba Búsqueda...",
                        nothingSelected: "Ningún evento seleccionado"         //default-label is deprecated and replaced with this.
                    }

                    scope.showAlertSaveCalenderizedError = false;
                    scope.showAlertErrorSaveCalenderizedError = false;
                    scope.disableVehicles = true;
                }
            };
        });
