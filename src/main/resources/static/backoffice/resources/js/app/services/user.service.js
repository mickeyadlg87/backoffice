/**
 * @ngdoc service
 * @name backofficeApp.user
 * @description # user Factory in the backofficeApp.
 * 
 * @author Andres David Leal
 */
angular.module('backOfficeNewapp')
        .factory('user', function (BaseResource) {

            var UserBaseResource = function () {
                BaseResource.apply(this, ['user', 'user']);
                this.actions.getUsersList = this.getCustomAction('backoffice/users/getListUsersByCompany',
                        'GET', true, true);

                this.actions.getProfileByUsername = this.getCustomAction('backoffice/users/getProfileForUser',
                        'GET', true);

                this.actions.updateProfileUser = this.getCustomAction('backoffice/users/updateProfileForUser/:id',
                        'POST', true);
                        
                this.actions.getProfilesForAsigned = this.getCustomAction('backoffice/users/getProfilesForAsigned',
                        'GET', true, true);
                        
                this.actions.updateUserSelected = this.getCustomAction('backoffice/users/updateUserSelected/:id',
                        'POST', true);

                this.actions.insertNewUser = this.getCustomAction('backoffice/users/insertNewUser/:id',
                        'POST', true);
                        
                this.actions.getByUsername = this.getCustomAction('backoffice/users/getByUsername',
                        'GET', true);
                        
            };
            // reuse the original object prototype
            UserBaseResource.prototype = new BaseResource();

            return new UserBaseResource().getResource();
        });