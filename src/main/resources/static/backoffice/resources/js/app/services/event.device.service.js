/**
 * @ngdoc service
 * @name backofficeApp.eventDevice
 * @description # user Factory in the backofficeApp.
 * 
 * @author Andres David Leal
 */
angular.module('backOfficeNewapp')
        .factory('eventdevice', function (BaseResource) {

            var EventDeviceBaseResource = function () {
                BaseResource.apply(this, ['eventdevice', 'eventdevice']);
                this.actions.getAllDeviceType = this.getCustomAction('backoffice/deviceType/getListDeviceType',
                        'GET', true, true);
                        
                this.actions.getAllEventsByMid = this.getCustomAction('backoffice/devices/getEventsListByImei',
                        'GET', true, true);

                this.actions.getAllEvent = this.getCustomAction('backoffice/event/getListEvents',
                        'GET', true, true);

                this.actions.getEnableEventsByDevice = this.getCustomAction('backoffice/event/getEventByDeviceType',
                        'GET', true, true);

                this.actions.updateEventsForDev = this.getCustomAction('backoffice/event/updateEventsForDevType/:id',
                        'POST', true);

            };
            // reuse the original object prototype
            EventDeviceBaseResource.prototype = new BaseResource();

            return new EventDeviceBaseResource().getResource();
        });