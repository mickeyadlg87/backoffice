'use strict';

angular.module('backOfficeNewapp')
        .directive('modal', function () {
            return {
                template: '<div class="modal fade" id="modal-send-email">' +
                        '<div class="modal-dialog" style="width:95%">' +
                        '<div class="modal-content">' +
                        '<div class="modal-header">' +
                        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                        '<h4 class="modal-title" id="genericTitleModal"><span ng-if="realm==\'entel\'" class="message-important">[ </span>{{ title }}</h4>' +
                        '</div>' +
                        '<div class="modal-body" ng-transclude></div>' +
                        '</div>' +
                        '</div>' +
                        '</div>',
                restrict: 'E',
                transclude: true,
                size: 'lg',
                replace: true,
                scope: true,
                link: function (scope, element, attrs) {
                    scope.realm = attrs.realm;
//    	  console.log("scope.realm modal ", scope.realm);
                    scope.title = attrs.title;

                    scope.$watch(attrs.visible, function (value) {
                        if (value == true)
                            $(element).modal('show');
                        else
                            $(element).modal('hide');
                    });

                    $(element).on('shown.bs.modal', function () {
                        scope.$apply(function () {
                            scope.$parent[attrs.visible] = true;
                        });
                    });

                    $(element).on('hidden.bs.modal', function () {
                        scope.$apply(function () {
                            scope.$parent[attrs.visible] = false;
                        });
                    });
                }
            };
        });