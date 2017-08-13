/**
 * @ngdoc service
 * @name backofficeApp.potacommand
 * @description # pota command Factory in the backofficeApp.
 * 
 * @author Andres leal
 */
angular.module('backOfficeNewapp')
        .factory('potacommand', function (BaseResource){
            var PotaCommandBaseResource = function () {
                BaseResource.apply(this, ['potacommand', 'potacommand']);
                this.actions.getPotaTypes = this.getCustomAction('backoffice/pota/getListPota',
                        'GET', true, true); 
                        
                this.actions.getPotaCommandByName = this.getCustomAction('backoffice/pota/getPotaByType',
                        'GET', true); 
                
                this.actions.sendPotaCommand = this.getCustomAction('backoffice/pota/sendPotaCommand/:id',
                        'POST', true);
                        
                this.actions.sendPotaCommandWithFilter = this.getCustomAction('backoffice/pota/sendPotaCommandWithFilter/:id',
                        'POST', true);
                        
                this.actions.getListHistoryPota = this.getCustomAction('backoffice/pota/getHistoryPotaByImei',
                        'GET', true, true);        
                        
            };
            // reuse the original object prototype
            PotaCommandBaseResource.prototype = new BaseResource();

            return new PotaCommandBaseResource().getResource();
        });
