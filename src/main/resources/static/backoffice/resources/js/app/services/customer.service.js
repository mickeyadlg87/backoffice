/**
 * @ngdoc service
 * @name backofficeApp.customer
 * @description # user Factory in the backofficeApp.
 * 
 * @author Andres David Leal
 */
angular.module('backOfficeNewapp')
        .factory('company', function (BaseResource) {

            var CompanyBaseResource = function () {
                BaseResource.apply(this, ['company', 'company']);
                this.actions.getCompanyList = this.getCustomAction('backoffice/company/getMetadataCompanyList',
                        'GET', true, true);

                this.actions.updateCompanySelected = this.getCustomAction('backoffice/company/updateMetaCompany/:id',
                        'POST', true);

                this.actions.insertNewCompany = this.getCustomAction('backoffice/company/insertMetaCompany/:id',
                        'POST', true);
                        
                this.actions.getCustomerBackoffice = this.getCustomAction('backoffice/company/getCustomerBackoffice',
                        'GET', true);
                        
            };
            // reuse the original object prototype
            CompanyBaseResource.prototype = new BaseResource();

            return new CompanyBaseResource().getResource();
        });