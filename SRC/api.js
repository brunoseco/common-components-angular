(function () {
    'use strict';

    angular.module('common.utils')
        .service('Api', Api);

    Api.$inject = ['$http', '$httpParamSerializer', '$log', 'Loading', 'Cache', 'Notification', 'endpoints', 'JsonParseService', 'configsConstants', '$state']

    function Api($http, $httpParamSerializer, $log, Loading, Cache, Notification, endpoints, JsonParseService, configsConstants, $state) {

        var init = function (o) {

            this.Resourse = o;

            this.DefaultFilter = {
                PageSize: 50,
                PageIndex: 0,
                IsPaginate: true,
                QueryOptimizerBehavior: "",
            };

            this.EnableLoading = true;
            this.EnableErrorMessage = true;
            this.EnableLogs = true;
            this.Filter = {};
            this.Data = {};
            this.Cache = false;
            this.LastAction = "none";
            this.Url = "";

            this.SuccessHandle = function (data) { return data; };
            this.ErrorHandle = function (err) { return err; };

            this.Get = _get;
            this.GetDetails = _getDetails;
            this.Post = _post;
            this.Put = _put;
            this.Delete = _delete;
            this.DataItem = _dataitem;
            this.GetDataListCustom = _getDataListCustom;
            this.GetDataCustom = _getDataCustom;
            this.GetMethodCustom = _getMethodCustom;

            var self = this;

            function _post() {

                ShowLoading();

                self.LastAction = "post";
                self.Url = makeUri();

                return $http
                    .post(self.Url, self.Data)
                    .then(handleSuccess, handleError);
            }

            function _put() {

                ShowLoading();

                self.LastAction = "put";
                self.Url = makeUri();

                return $http
                    .put(self.Url, self.Data)
                    .then(handleSuccess, handleError);
            }

            function _delete() {

                ShowLoading();

                self.LastAction = "delete";
                self.Url = makeDeleteBaseUrl();

                return $http
                    .delete(self.Url)
                    .then(handleSuccess, handleError);
            }

            function _get() {

                ShowLoading();

                self.LastAction = "get";
                self.Url = makeGetBaseUrl();

                if (isOffline())
                    return LoadFromCache();

                return $http
                    .get(self.Url)
                    .then(handleSuccess, handleError);
            }

            function _getDataListCustom() {
                return _getMethodCustom("GetDataListCustom");
            }

            function _getDetails() {
                return _getMethodCustom("GetDetails");
            }

            function _getDataCustom() {
                return _getMethodCustom("GetDataCustom");
            }

            function _dataitem() {
                return _getMethodCustom("GetDataItem");
            }

            function _getMethodCustom(method) {

                ShowLoading();

                self.LastAction = "get";
                self.Url = makeGetCustomMethodBaseUrl(method);

                if (isOffline())
                    return LoadFromCache();

                return $http
                    .get(self.Url)
                    .then(handleSuccess, handleError);
            }

            function dataPost() {
                return JSON.stringify(self.Data);
            }

            function queryStringFilter() {

                if (self.Filter.Id !== undefined)
                    return self.Filter.Id;

                if (self.Filter.OrderFields !== undefined) {
                    self.Filter.IsOrderByDynamic = true;
                    if (self.Filter.OrderByType === undefined)
                        self.Filter.OrderByType = 1;
                }

                return String.format("?{0}", $httpParamSerializer(angular.merge({}, self.DefaultFilter, self.Filter)));
            }

            function makeGetBaseUrl() {
                return String.format("{0}/{1}", makeUri(), queryStringFilter());
            }

            function makeGetCustomMethodBaseUrl(method) {
                return String.format("{0}/{1}/{2}", makeUri(), method, queryStringFilter());
            }

            function makeDeleteBaseUrl() {
                return String.format("{0}/?{1}", makeUri(), $httpParamSerializer(self.Filter));
            }

            function makeUri() {
                return String.format("{0}/{1}", makeEndPont(), self.Resourse)
            }

            function makeEndPont() {

                if (!self.EndPoint)
                    return endpoints.DEFAULT;

                return endpoints[self.EndPoint];
            }

            function handleSuccess(response) {
                HideLoading();

                if (self.EnableLogs)
                    $log.debug("sucesso na API >>", makeUri())

                AddCache(response.data);

                self.SuccessHandle(JsonParseService.exec(response.data));
            }

            function handleError(err) {
                HideLoading();

                if (self.EnableLogs)
                    $log.error("erro na API >>", makeUri())

                if (self.EnableErrorMessage)
                    Notification.error({ message: err.data.Errors[0], title: 'Ops, ocorreu um erro!' })

                if (err.status == 401)
                    $state.go(configsConstants.STATE_STATUSCODE_401);

                self.ErrorHandle(JsonParseService.exec(err.data));
            }

            String.format = function () {
                var theString = arguments[0];
                for (var i = 1; i < arguments.length; i++) {
                    var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
                    theString = theString.replace(regEx, arguments[i]);
                }

                return theString;
            }

            function ShowLoading() {
                if (self.EnableLoading)
                    Loading.show();
            }

            function HideLoading() {
                if (self.EnableLoading)
                    Loading.hide();
            }

            function AddCache(data) {

                if (!self.Cache)
                    return;

                if (self.Url == "")
                    return;

                if (self.LastAction == "get") {
                    if (data.Data != null || (data.DataList != null && data.DataList.length > 0)) {
                        data = JSON.stringify(data);
                        Cache.Add(self.Url, data)
                    }
                }
            }

            function LoadFromCache() {

                if (!self.Cache)
                    return;

                HideLoading();

                if (self.EnableLogs)
                    $log.debug("sucesso na API (by Cache) >>", makeUri())

                var data = Cache.Get(self.Url);
                data = JSON.parse(data);

                if (data != null)
                    self.SuccessHandle(data);

            }

            function isOffline() {

                if (navigator.network != null) {
                    var isOffline = !navigator.onLine;
                    return isOffline;
                }

                return false;
            }


        }

        this.resourse = function (o) {
            return new init(o);
        }

    }

})();