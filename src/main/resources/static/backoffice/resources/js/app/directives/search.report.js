angular.module('backOfficeNewapp')
        .directive('viewSearch', function ($location, $rootScope, usSpinnerService, company, unidad) {
    return {
        scope: {
            typeReport: '=report'
        },
        templateUrl: '/backoffice/resources/js/app/directives/layout/viewSearch.html',
        restrict: 'E',
        link: function (scope, elem, attrs) {
            scope.limitCustomerSearch = 1000;
            scope.disabledGroup = true;
            scope.showRangeSelector = false;
            scope.disableButtonCreate = true;
            scope.disabledCompany = true;
            var arrayData = new Array();
            var plataformas = new Array();
            var empresas = new Array();
            // variable para definir la cantidad de unidades por particion
            // de empresas que tengan mas de N moviles
            var groupSizeForUnits = 1000;
            scope.data = {};
            
            usSpinnerService.spin('spinner-1');
            console.log("tipo de reporte", scope.typeReport);
            
            if (scope.typeReport !== null) {
                plataformas = [
                    {name: 'Rastreosat Lite', alias: 'rslite', id: '1'},
                    {name: 'Rastreosat', alias: 'rastreosat', id: '2'},
                    {name: 'Entel', alias: 'entel', id: '3'}
                ];
                scope.disabledGroup = false;
                scope.plataformGroup = plataformas;
                scope.rangeList = [];
            }
            
            /**
             * crea el arreglo que tiene los rangos para la busqueda
             * de unidades estableciendo limit y offset
             * @param {type} totalUnit
             * @returns {Array}
             */
            function createRangeArray(totalUnit) {
                var size = groupSizeForUnits;
                var objRange = {};
                var rangeArray = new Array();
                for (var i = 0; i < totalUnit; i += size) {
                    objRange.name = i + ' - ' + (i + size - 1);
                    objRange.limit = size;
                    objRange.offset = i;
                    rangeArray.push(objRange);
                    objRange = {};
                }
                return rangeArray;
            }

            // Función ejecutada al seleccionar una plataforma, carga los
            // clientes de la misma
            scope.changePlataform = function (plataform) {
                
                        if (scope.typeReport === "usuarios" || scope.typeReport === "unidades" || scope.typeReport === "darDeBaja") {
                            var objCompany = {};
                            empresas = new Array();
                            usSpinnerService.spin('spinner-1');
                            scope.data.companySelected = undefined;
                            scope.disabledCompany = true;

                            company.getCompanyList({
                                'realm': plataform,
                                'limit': 1,
                                'offset': 0,
                                'sortBy': 'name'
                            }, function (rawData) {
                                arrayData = rawData;
                                if (arrayData.length >= 1) {
                                    angular.forEach(arrayData, function (valueCompany, key) {
                                        objCompany['id'] = valueCompany.id;
                                        objCompany['name'] = valueCompany.name;
                                        empresas.push(objCompany);
                                        objCompany = {};
                                    });
                                    scope.disabledCompany = false;
                                    scope.customerGroup = empresas;

                                } else {
                                    scope.disabledCompany = true;
                                }
                                usSpinnerService.stop('spinner-1');
                            }, function (error) {
                                usSpinnerService.stop('spinner-1');
                                console.log("error get companies for combobox");
                                scope.disabledCompany = true;
                            });

                        }                
            };
            
            // esto para saber la cantidad de moviles (unidades) que tiene cada empresa
            scope.changeCompany = function (companyId) {
                // solo aplica para cuando se listan unidades por empresa
                if (scope.typeReport === "unidades" || scope.typeReport === "darDeBaja") {
                    scope.data.rangeSel = undefined;
                    unidad.getUnitsList({
                        'realm': scope.data.plataform,
                        'companyId': companyId,
                        'limit': 1,
                        'offset': 0
                    }, function (arrayUnits) {
                        if (arrayUnits.length >= 1 && arrayUnits[0].total >= groupSizeForUnits) {
                            scope.rangeList = createRangeArray(arrayUnits[0].total);
                            scope.showRangeSelector = true;
                        } else {
                            scope.rangeList = [];
                            scope.showRangeSelector = false;
                        }
                    }, function (err) {
                        console.error(err);
                        scope.rangeList = [];
                        scope.showRangeSelector = false;
                    });
                }
            };

            usSpinnerService.stop('spinner-1');

            //accion ejecutada por el boton consultar
            scope.search = function (data, rangeDate) {
                data.datefrom = scope.dateFromPicker.date;
                data.dateTo = scope.dateToPicker.date;
                $rootScope.$broadcast('search', data, rangeDate);
            };
            
            // accion ejecutada por el boton adicionar
            scope.createRedd = function (dataFilter) {
                $rootScope.$broadcast('create', dataFilter);
            };

            scope.$on('disableButtonSearch', function (event, status) {
                scope.disableButtonSearch = status;
            });
            
            scope.$on('disableButtonCreate', function (event, status) {
                scope.disableButtonCreate = status;
            });
            
            scope.rangeDate = -1;

            scope.localLang = {
                selectAll: "Seleccionar Todos",
                selectNone: "Sin Seleccion",
                reset: "Resetear",
                search: "Escriba Búsqueda...",
                nothingSelected: "Ningún evento seleccionado"         //default-label is deprecated and replaced with this.
            };
            
            /**
             * validacion texto introducido en filtro
             * @param {type} customerTyped
             * @returns {undefined}
             */
            scope.checkCustomer = function (customerTyped) {
                if (customerTyped.length >= 1) {
                    scope.limitCustomerSearch = 100;
                } else {
                    scope.limitCustomerSearch = 5;
                }
            };
            
            scope.dateFromPicker = {
                date: new Date(),
                datepickerOptions: {
                    maxDate: null
                },
                timepickerOptions: {
                    max: null
                }
            };
            
            scope.dateToPicker = {
                date: new Date(),
                datepickerOptions: {
                    minDate: null
                },
                timepickerOptions: {
                    min: null
                }
            };
            
            // fecha desde un dia antes de la fecha actual
            scope.dateFromPicker.date.setDate(scope.dateFromPicker.date.getDate() - 1);

            // abre o cierra el calendario que corresponda
            scope.openCalendar = function (e, picker) {
                scope[picker].open = true;
            };
            
            // watch min and max dates to calculate difference and set max and min aviable date time
            var unwatchMinMaxValues = scope.$watch(function () {
                return [scope.dateFromPicker, scope.dateToPicker];
            }, function () {
                // min max dates
                scope.dateFromPicker.datepickerOptions.maxDate = scope.dateToPicker.date;
                scope.dateToPicker.datepickerOptions.minDate = scope.dateFromPicker.date;
                
                // min max times
                scope.dateFromPicker.timepickerOptions.max = scope.dateToPicker.date;
                scope.dateToPicker.timepickerOptions.min = scope.dateFromPicker.date;

//                if (that.picker4.date && that.picker5.date) {
//                    var diff = that.picker4.date.getTime() - that.picker5.date.getTime();
//                    that.dayRange = Math.round(Math.abs(diff / (1000 * 60 * 60 * 24)))
//                } else {
//                    that.dayRange = 'n/a';
//                }
                
            }, true);
            
            // destroy watcher
            scope.$on('$destroy', function () {
                unwatchMinMaxValues();
            });
        }
    };
});
