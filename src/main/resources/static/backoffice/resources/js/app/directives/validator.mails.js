angular.module('backOfficeNewapp')
        .directive('validatorMails', function () {
            return {
                require: 'ngModel',
                link: function (scope, elm, attrs, ctrl) {

                    var validate = function (viewValue) {
                        var viewValueDefault = viewValue;
                        var inputValid = true;
                        var regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

                        if (!viewValue) {
                            // It's valid because we have nothing to compare against
                            ctrl.$setValidity('validatorMails', true);
                            return viewValueDefault;
                        }

                        //borro espacios entre correos
                        viewValue = viewValue.replace(/ /g, '')
                        viewValue = viewValue.split(",");
                        var resultRegex;
                        angular.forEach(viewValue, function (value) {
                            resultRegex = regex.test(value)
                            if (!resultRegex) {
                                inputValid = false;
                            }
                        });

                        ctrl.$setValidity('validatorMails', resultRegex);
                        return viewValueDefault;
                    };

                    ctrl.$parsers.unshift(validate);
                    ctrl.$formatters.push(validate);

                    attrs.$observe('validatorMails', function () {
                        return validate(ctrl.$viewValue);
                    });
                }
            };
        });