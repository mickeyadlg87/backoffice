/**
 * @ngdoc service
 * @name backofficeApp.device
 * @description # user Factory in the backofficeApp.
 * 
 * @author Fabian Godoy
 */
angular.module('backOfficeNewapp')
        .factory('dispositivo', function (BaseResource) {

            var DeviceBaseResource = function () {
                BaseResource.apply(this, ['dispositivo', 'dispositivo']);
                this.actions.getDeviceList = this.getCustomAction('backoffice/devices/getDeviceByRealm',
                        'GET', true, true);
                        
                this.actions.getEventsForValidate = this.getCustomAction('backoffice/devices/getEventForValidate',
                        'GET', true, true);
                        
                this.actions.getAccessoriesForValidate = this.getCustomAction('backoffice/devices/getAccessoriesForValidate',
                        'GET', true, true);
                        
                this.actions.validateEvents = this.getCustomAction('backoffice/devices/validateEventForCertificate/:id',
                        'POST', true);

                this.actions.updateDeviceSelected = this.getCustomAction('backoffice/devices/updateDeviceSelected',
                        'POST', true);

                this.actions.updateSimCardDevice = this.getCustomAction('backoffice/devices/updateSimCardDevice/:id',
                        'POST', true);
                        
                this.actions.insertNewSimCardForDevice = this.getCustomAction('backoffice/device/insertNewSimCardForDevice',
                        'POST', true);
                        
                this.actions.saveAccessoriesForDevice = this.getCustomAction('backoffice/device/saveAccessoriesForDevice',
                        'POST', true);
                        
                this.actions.getAccessoriesInstalled = this.getCustomAction('backoffice/devices/getAccessoriesInstalled',
                        'GET', true);
            };
            // reuse the original object prototype
            DeviceBaseResource.prototype = new BaseResource();

            return new DeviceBaseResource().getResource();
        });

