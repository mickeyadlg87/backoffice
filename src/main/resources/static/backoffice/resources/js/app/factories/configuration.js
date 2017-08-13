'use strict';

/**
 * @ngdoc Factory
 * @name reposteriaApp.config
 * @description # config Factory in the reposteriaApp.
 * 
 * @a
 */
angular.module('backOfficeNewapp')
        .factory('config', function () {
            var baseUrl = '';
            return {
                baseUrl: baseUrl,
                apiUrl: baseUrl
            };
        });