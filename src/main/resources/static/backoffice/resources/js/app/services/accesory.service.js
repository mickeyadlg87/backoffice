/**
 * @ngdoc service
 * @name backofficeApp.accesorydeice
 * @description # Factory in the backofficeApp.
 * 
 * @author Andres David Leal
 */
angular.module('backOfficeNewapp')
        .factory('accesorydevice', function (BaseResource) {

            var AccesoryDeviceBaseResource = function () {
                BaseResource.apply(this, ['accesorydevice', 'accesorydevice']);

                this.actions.getAllAccesories = this.getCustomAction('backoffice/accesories/getAll',
                        'GET', true, true);
                        
                this.actions.getAccesoriesForReport = this.getCustomAction('backoffice/report/getCertifiedDevicesReport',
                        'GET', true, true);

                this.actions.getEnableAccessoryByDevice = this.getCustomAction('backoffice/accesories/getByDeviceType',
                        'GET', true, true);

                this.actions.updateForDevice = this.getCustomAction('backoffice/accesories/updateForDeviceType/:id',
                        'POST', true);

            };
            // reuse the original object prototype
            AccesoryDeviceBaseResource.prototype = new BaseResource();

            return new AccesoryDeviceBaseResource().getResource();
        });