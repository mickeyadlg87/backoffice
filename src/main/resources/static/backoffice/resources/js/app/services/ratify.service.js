/**
 * @ngdoc service
 * @name backofficeApp.unsubscribe
 * @description # unit Factory in the backofficeApp.
 * 
 * @author Fabian Godoy
 */
angular.module('backOfficeNewapp')
        .factory('ratify', function (BaseResource){
            var UnitBaseResource = function () {
                BaseResource.apply(this, ['ratify', 'ratify']);
                this.actions.getUnitsListForRatify = this.getCustomAction('backoffice/units/getListUnitsByCompanyForRatify',
                        'GET', true, true);
                
                this.actions.updateUnsubcribeUnit = this.getCustomAction('backoffice/units/updateUnitUnsubscribe',
                        'POST', true);

            };
            // reuse the original object prototype
            UnitBaseResource.prototype = new BaseResource();

            return new UnitBaseResource().getResource();;
        });
