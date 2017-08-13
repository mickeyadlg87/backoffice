/**
 * @ngdoc service
 * @name backofficeApp.unsubscribe
 * @description # unit Factory in the backofficeApp.
 * 
 * @author Fabian Godoy
 */
angular.module('backOfficeNewapp')
        .factory('unsubscribe', function (BaseResource){
            var UnitBaseResource = function () {
                BaseResource.apply(this, ['unsubscribe', 'unsubscribe']);
                this.actions.getUnitsListForUnsubcribe = this.getCustomAction('backoffice/units/getListUnitsByCompany',
                        'GET', true, true);
                
                this.actions.getGeneralState = this.getCustomAction('backoffice/units/getGeneralState',
                        'GET', true, true); 
                
                this.actions.updateUnsubcribeUnit = this.getCustomAction('backoffice/units/updateUnitUnsubscribe',
                        'POST', true);
                        
                this.actions.getUnsubcribeReport = this.getCustomAction('backoffice/units/getUnsubcribeReport',
                        'GET', true, true); 
            };
            // reuse the original object prototype
            UnitBaseResource.prototype = new BaseResource();

            return new UnitBaseResource().getResource();;
        });


