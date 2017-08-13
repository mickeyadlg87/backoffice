'use strict';

/**
 * @ngdoc service
 * @name reposteriaApp.baseResource
 * @description # baseResource Factory in the reposteriaApp.
 * 
 * @author Marcela Guzmán Martínez <mguzman@gps.cl>
 */
angular.module('backOfficeNewapp')
        .factory('BaseResource', function (config, $resource) {
            var defaultHeaders = {
                // 'Authorization' : user.getToken(),
                'Content-Type': 'application/json'
            };
            var BaseResource = function (singularName, pluralName) {
                this.singularName = singularName;
                this.pluralName = pluralName;
                this.actions = this.getDefaultActions();
            };

            BaseResource.prototype.getDefaultActions = function () {
                return defaultHeaders;
            };

            BaseResource.prototype.getDefaultActions = function () {
                var self = this;
                return {
                    'get': {
                        method: 'GET',
                        headers: defaultHeaders,
                        transformResponse: function (data) {
                            return self.transformResponse(data);
                        }
                    },
                    'query': {
                        method: 'GET',
                        isArray: true,
                        headers: defaultHeaders,
                        transformResponse: function (data) {
                            return self.transformResponse(data);
                        }
                    },
                    'update': {
                        method: 'PATCH',
                        headers: defaultHeaders,
                        transformRequest: function (data) {
                            return self.transformRequest(data);
                        }
                    },
                    'save': {
                        method: 'POST',
                        headers: defaultHeaders,
                        interceptor: {
                            response: function (response) {
                                var result = response.resource;
                                result.$status = response.status;
                                return result;
                            }
                        },
                        transformRequest: function (data) {
                            return self.transformRequest(data);
                        }
                    }
                };
            };

            BaseResource.prototype.getCustomAction = function (url, method,
                    isRequestAction, isArray) {
                var customAction = {};
                customAction.method = method;
                customAction.url = config.apiUrl + '/' + url;
                var self = this;
                if (isRequestAction) {
                    customAction.transformRequest = function (data) {
                        return self.transformRequest(data);
                    };
                } else {
                    customAction.transformResponse = function (data) {
                        return self.transformResponse(data);
                    };
                }
                if (isArray) {
                    customAction.isArray = isArray;
                }
                return customAction;
            };

            BaseResource.prototype.transformResponse = function (data) {
                return this.serializerData(data);
            };

            BaseResource.prototype.transformRequest = function (data) {
                var cloneData = {};
                angular.copy(data, cloneData);
                if (cloneData['id']) {
                    delete cloneData['id'];
                }
                return this.deserializerData(cloneData);
            };

            BaseResource.prototype.serializerData = function (data) {
                if (data) {
                    var data = angular.fromJson(data);
                    if (data.result) {
                        return data.result;
                    }
                }
                return {};
            };

            BaseResource.prototype.deserializerData = function (data) {
                var deserializerData = {};
                deserializerData[this.singularName] = data;
                return angular.toJson(deserializerData);
            };

            BaseResource.prototype.getResource = function () {
                var url = config.apiUrl + '/' + this.pluralName + '/:id';
                return $resource(url, {
                    id: '@id'
                }, this.actions);
            };

            return BaseResource;
        });