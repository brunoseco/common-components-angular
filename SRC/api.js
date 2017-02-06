(function () {
    'use strict';

    angular.module('common.utils')
        .service('Api', Api);

    Api.$inject = ['$http', '$httpParamSerializer', '$log', 'Loading', 'Cache', 'Notification', 'endpoints', 'JsonParseService', 'configsConstants', '$state', 'compatibilityConstants', 'Uri']

    function Api($http, $httpParamSerializer, $log, Loading, Cache, Notification, endpoints, JsonParseService, configsConstants, $state, compatibilityConstants, Uri) {

        var init = function (o) {

            this.Resourse = o;

            this.DefaultFilter = {
                PageSize: 50,
                PageIndex: 0,
                IsPaginate: true,
                QueryOptimizerBehavior: "",
            };
            this.Filter = {};

            this.EnableLoading = true;
            this.EnableErrorMessage = true;
            this.EnableLogs = true;
            this.Data = {};
            this.Cache = false;
            this.LastAction = "none";
            this.Url = "";
            this.UriResource = Uri.resource(o);

            this.SuccessHandle = function (data) { return data; };
            this.ErrorHandle = function (err) { return err; };

            this.Get = _get;
            this.Post = _post;
            this.Put = _put;
            this.Delete = _delete;

            this.GetDetails = _getDetails;
            this.DataItem = _dataitem;
            this.GetDataListCustom = _getDataListCustom;
            this.GetDataCustom = _getDataCustom;
            this.GetMoreResource = _getMoreResource;

            var self = this;

            function _post() {

                ShowLoading();

                self.LastAction = "post";
                self.UriResource.setEndPoint(this.EndPoint)
                self.Url = self.UriResource.makeUri();

                console.log(self.Data);

                return $http
                    .post(self.Url, self.Data)
                    .then(handleSuccess, handleError);
            }

            function _put() {

                ShowLoading();

                self.LastAction = "put";
                self.UriResource.setEndPoint(self.EndPoint)
                self.Url = self.UriResource.makeUri();

                console.log("Put API", self.Data);

                return $http
                    .put(self.Url, self.Data)
                    .then(handleSuccess, handleError);
            }

            function _delete() {

                ShowLoading();

                self.LastAction = "delete";
                self.UriResource.setEndPoint(self.EndPoint)
                self.Url = makeDeleteBaseUrl();

                return $http
                    .delete(self.Url)
                    .then(handleSuccess, handleError);
            }

            function _get() {

                ShowLoading();

                self.LastAction = "get";
                self.UriResource.setEndPoint(self.EndPoint)
                self.Url = self.UriResource.makeGetBaseUrl(self.Filter);

                if (isOffline())
                    return LoadFromCache();

                return $http
                    .get(self.Url)
                    .then(handleSuccess, handleError);
            }

            function _getDataListCustom() {
                return _getMoreResource("GetDataListCustom");
            }

            function _getDetails() {
                return _getMoreResource("GetDetails");
            }

            function _getDataCustom() {
                return _getMoreResource("GetDataCustom");
            }

            function _dataitem() {
                return _getMoreResource("GetDataItem");
            }

            function _getMoreResource(filterBehavior) {

                

                ShowLoading();

                self.LastAction = "get";
                self.UriResource.setEndPoint(self.EndPoint)
                self.Url = makeGetMoreResourceBaseUrl(filterBehavior);

                console.log('Url: ' + self.Url);

                if (isOffline())
                    return LoadFromCache();

                return $http
                    .get(self.Url)
                    .then(handleSuccess, handleError);
            }

            function dataPost() {
                return JSON.stringify(self.Data);
            }

            function makeGetMoreResourceBaseUrl(filterBehavior) {
                return compatibilityConstants.MakeGetMoreResourceBaseUrlAPI(self.UriResource, self.Filter, filterBehavior);
            }

            function makeDeleteBaseUrl() {
                return String.format("{0}/?{1}", self.UriResource.makeUri(), $httpParamSerializer(self.Filter));
            }

            function handleSuccess(response) {
                HideLoading();

                if (self.EnableLogs)
                    $log.debug("sucesso na API >>", self.UriResource.makeUri())

                AddCache(response.data);

                console.log(response.data);
                self.SuccessHandle(JsonParseService.exec(response.data));
            }

            function handleError(err) {

                console.log(err);

                HideLoading();

                if (err.data == null)
                    return;

                if (self.EnableLogs)
                    $log.error("erro na API >>", self.UriResource.makeUri())


                if (self.EnableErrorMessage) {

                    if (compatibilityConstants.GetErrorsAPI(err) != null)
                        Notification.error({ message: compatibilityConstants.GetErrorsAPI(err)[0], title: 'Ops, ocorreu um erro!' })
                }

                if (err.status == 401)
                    $state.go(configsConstants.STATE_STATUSCODE_401);

                if (err.status == 415)
                    Notification.error({ message: err.statusText, title: 'Ops, ocorreu um erro!' })

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

                console.log("AddCache", data);

                if (self.LastAction == "get") {
                    if (compatibilityConstants.GetData(data) != null || (compatibilityConstants.GetDataList(data) != null && compatibilityConstants.GetDataList(data).length > 0)) {
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
                    $log.debug("sucesso na API (by Cache) >>", self.UriResource.makeUri())

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