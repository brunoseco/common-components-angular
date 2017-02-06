(function () {
    'use strict';

    angular.module('common.utils')
        .service('Uri', Uri);

    Uri.$inject = ['$httpParamSerializer', 'endpoints']

    function Uri($httpParamSerializer, endpoints) {

        var init = function (resource) {

            this.Resourse = resource;
            
            this.DefaultFilter = {
                PageSize: 50,
                PageIndex: 0,
                IsPaginate: true,
                QueryOptimizerBehavior: "",
            };

            this.queryStringFilter = _queryStringFilter;
            this.makeGetBaseUrl = _makeGetBaseUrl;
            this.makeUri = _makeUri;
            this.setEndPoint = _setEndPoint;

            var self = this;

            function _setEndPoint(endpoint) {
                this.EndPoint = endpoint;
            }

            function _queryStringFilter(filter, filterBehavior) {

                if (filter != undefined && filter.OrderFields !== undefined) {
                    filter.IsOrderByDynamic = true;
                    if (filter.OrderByType === undefined)
                        filter.OrderByType = 1;
                }

                if (filterBehavior !== undefined)
                    filter.FilterBehavior = filterBehavior;

                var filterMerged = $httpParamSerializer(angular.merge({}, self.DefaultFilter, filter));

                if (filter.Id !== undefined)
                    return String.format("{0}?{1}", filter.Id, filterMerged);

                return String.format("?{0}", filterMerged);
            }

            function _makeUri() {
                return String.format("{0}/{1}", _makeEndPoint(), self.Resourse)
            }

            function _makeEndPoint() {
                if (!self.EndPoint)
                    return endpoints.DEFAULT;

                return endpoints[self.EndPoint];
            }


            function _makeGetBaseUrl(filter) {
                return String.format("{0}/{1}", _makeUri(), _queryStringFilter(filter));
            }

        }

        this.resource = function (resource, endpoint) {
            return new init(resource, endpoint);
        }

    }

})();