/**
 * @ngdoc service
 * @name backofficeApp.facturationreport
 * @description # user Factory in the backofficeApp.
 * 
 * @author fgodoy
 */
angular.module('backOfficeNewapp')
        .factory('facturation', function (BaseResource) {

            var ReportFacturationBaseResource = function () {
                BaseResource.apply(this, ['facturation', 'facturation']);
                this.actions.getFacturationReportFilter = this.getCustomAction('backoffice/report/getFacturationReportFilter',
                        'GET', true, true);
                        
                this.actions.getQuantityForCompany = this.getCustomAction('backoffice/report/getQuantityForCompanyFilter',
                        'GET', true, true);
                        
                this.actions.getQuantityForTypeOfSale = this.getCustomAction('backoffice/report/getQuantityForSaleType',
                        'GET', true, true);
                        
                this.actions.getAllFacturationReport = this.getCustomAction('backoffice/report/getAllFacturationReport',
                        'GET', true, true);
                        
                this.actions.insertReport = this.getCustomAction('backoffice/report/insertNewReport/:id',
                        'POST', true);
                        
                this.actions.updateNewReport = this.getCustomAction('backoffice/report/updateReport/:id',
                        'POST', true);
            };
            // reuse the original object prototype
            ReportFacturationBaseResource.prototype = new BaseResource();

            return new ReportFacturationBaseResource().getResource();
        });

