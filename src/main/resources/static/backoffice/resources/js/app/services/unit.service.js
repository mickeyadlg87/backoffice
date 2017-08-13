/**
 * @ngdoc service
 * @name backofficeApp.unite
 * @description # unit Factory in the backofficeApp.
 * 
 * @author Fabian Godoy
 */
angular.module('backOfficeNewapp')
        .factory('unidad', function (BaseResource) {

            var UnitBaseResource = function () {
                BaseResource.apply(this, ['unidad', 'unidad']);
                this.actions.getUnitsList = this.getCustomAction('backoffice/units/getListUnitsByCompany',
                        'GET', true, true);
                        
                this.actions.updateUnit = this.getCustomAction('backoffice/units/updateUnit',
                        'POST', true);

                this.actions.getUnitByImei = this.getCustomAction('backoffice/units/getUnitByMid',
                        'GET', true);
                
                this.actions.getUnitListForCert = this.getCustomAction('backoffice/units/getUnitListForCert',
                        'GET', true, true);
                        
                this.actions.getAccessoriesAndEventForValidate = this.getCustomAction('backoffice/units/getAccessoriesAndEventForValidate',
                        'GET', true, true);
                        
                this.actions.insertInfoCertUnit = this.getCustomAction('backoffice/units/insertInfoCertUnit',
                        'POST', true);
                        
                this.actions.getCertifiedReport = this.getCustomAction('backoffice/report/getCertifiedReport',
                        'GET', true, true);
                                              
            };
            // reuse the original object prototype
            UnitBaseResource.prototype = new BaseResource();

            return new UnitBaseResource().getResource();
        });

