'use strict';

angular.module('backOfficeNewapp').directive('onReadFile', function ($parse) {
    return {
        restrict: 'A',
        scope: false,
        link: function (scope, element, attrs) {
            var fn = $parse(attrs.onReadFile);

            element.on('change', function (onChangeEvent) {
                var reader = new FileReader();

                reader.onload = function (onLoadEvent) {
                    scope.$apply(function () {
                        fn(scope, {$fileContent: onLoadEvent.target.result,
                            $fileType: (onChangeEvent.srcElement || onChangeEvent.target).files[0].type
                        });
                    });
                };

                reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
            });
        }
    };
});

angular.module('backOfficeNewapp')
        .controller('loadSimCardController', function ($scope, $timeout, $http, $rootScope, $localStorage, usSpinnerService, user) {
            
            var realmback = "backoffice";
            $scope.showSaveParameters = false;
            $scope.showErrorSaveParameters = false;
            $scope.showErrorLoadFile = false;
            $scope.chargeDisabled = true;
            $scope.showLoadButton = true;
            
            $scope.alertSaveParameters = [{type: 'success', msg: 'La carga ha sido exitosa'}];
            $scope.alertErrorSaveParameters = [{type: 'danger', msg: 'Ha ocurrido un error al cargar, por favor vuelva a intentar'}];
            $scope.alertErrorLoadFile = [{type: 'danger', msg: 'No se pudo cargar el archivo seleccionado'}];

            /**
             * Procesa contenido del archivo para guardar info
             */
            $scope.processLoadFile = function () {
                
                usSpinnerService.spin('spinner-7');
                // convierte el contenido del archivo en un arreglo de simcards,
                // que contienen el numero y el ICCID
                var arraySimcard = $scope.content.trim().split('\n').map(function (line) {
                    return line.split(',');
                }).reduce(function (listSimcard, line) {
                    listSimcard.push({
                        'phoneNumber': line[0].trim(),
                        'iccid': line[1].trim()
                    });
                    return listSimcard;
                }, []);
                
                $scope.chargeDisabled = true;
                $scope.showLoadButton = false;
                
                $http.post("/backoffice/simcard/saveList?realm=" + realmback + "&username=" + $localStorage.user, arraySimcard)
                        .success(function (data, status) {
                            if (data.result) {
                                $scope.showSaveParameters = true;
                                $scope.showErrorSaveParameters = false;
                            } else {
                                $scope.showSaveParameters = false;
                                $scope.showErrorSaveParameters = true;
                            }
                            $scope.chargeDisabled = false;
                            $scope.showLoadButton = true;
                            usSpinnerService.stop('spinner-7');
                        }).error(function (data, status) {
                            $scope.showSaveParameters = false;
                            $scope.showErrorSaveParameters = true;
                            $scope.chargeDisabled = false;
                            $scope.showLoadButton = true;
                            usSpinnerService.stop('spinner-7');
                            console.error('Error occurred: ', data, status);
                        });

            };
            
            $scope.closeAlertParameters = function (index) {
                $scope.showSaveParameters = false;
                $scope.showErrorSaveParameters = false;
                $scope.showErrorLoadFile = false;
            };
            
            $scope.showContent = function (fileCont, fileType) {
                // el archivo debe ser TXT
                if (fileType == 'text/plain') {
                    $scope.showErrorLoadFile = false;
                    $scope.content = fileCont;
                    $scope.chargeDisabled = false;
                } else {
                    $scope.content = undefined;
                    $scope.showErrorLoadFile = true;
                    $scope.chargeDisabled = true;
                }
                
            };
            
        });
        
