/**
 * @ngdoc service
 * @name backofficeApp.exportXls
 * @description # user Factory in the backofficeApp.
 * 
 * @author Andres David Leal
 */
angular.module('backOfficeNewapp')
        .factory('exportXls', function (BaseResource) {

            var exportXlsBaseResource = function () {
                BaseResource.apply(this, ['export', 'export']);
                this.actions.postExportXls = this.getCustomAction('backoffice/dataToExport/:id',
                        'POST', true);
            };
            // reuse the original object prototype
            exportXlsBaseResource.prototype = new BaseResource();

            return new exportXlsBaseResource().getResource();
        });

