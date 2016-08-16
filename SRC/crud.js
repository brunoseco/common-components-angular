(function () {
    'use strict';

    angular.module('common.utils')
        .service('Crud', Crud);

    Crud.$inject = ['Api', '$uibModal'];

    function Crud(Api, $uibModal) {

        var init = function () {

            this.default = {
                resource: null,
                endPoint: "BI",
                Filter: {
                    QueryOptimizerBehavior: null,
                    OrderFields: null,
                    OrderByType: 1,
                    CustomFilters: null,
                },
                Create: {
                    message: "Registro criado com sucesso!",
                    pathModal: null,
                    sizeModal: null,
                },
                Edit: {
                    message: "Registro alterado com sucesso!",
                    pathModal: null,
                    sizeModal: null,
                    onAfterRenderEdit: function (model) { return model; },
                },
                Delete: {
                    message: "Registro excluir com sucesso!",
                    confirm: "Tem certeza que deseja excluir este registro?",
                    pathModal: "view/shared/_exclusao.modal.html",
                },
                ChangeDataPost: function (model) {
                    return model;
                }
            };

            this.Config = {};
            this.Filter = _filter;
            this.LastFilters = {};
            this.Delete = _delete;
            this.Edit = _edit;
            this.Create = _create;
            this.GetConfigs = _getConfigs;
            this.SetViewModel = _setViewModel;
            this.LastAction = "none";
            this.ViewModel = null;

            this.Pagination = {
                PageChanged: _pageChanged,
                CurrentPage: 1,
                MaxSize: 10,
                ItensPerPage: 50,
                TotalItens: 0
            };

            var self = this;

            function _setViewModel(vm) {
                self.ViewModel = vm;
            }

            function _randomNum() {
                return Math.random();
            }

            function _filter(filters) {
                self.LastFilters = filters || {};
                self.LastFilters.PageIndex = 1;

                self.LastFilters.OrderFields = self.GetConfigs().Filter.OrderFields;
                self.LastFilters.OrderByType = self.GetConfigs().Filter.OrderByType;

                _load(self.LastFilters);
            };

            function _load(filters) {

                self.ApiResource = new Api.resourse(self.GetConfigs().resource);
                self.ApiResource.Filter = filters || {};

                self.ApiResource.Filter = angular.merge({}, self.GetConfigs().Filter.CustomFilters, filters || {});

                self.ApiResource.Filter.PageSize = self.Pagination.ItensPerPage;
                self.ApiResource.Filter.QueryOptimizerBehavior = self.GetConfigs().Filter.QueryOptimizerBehavior;

                self.ApiResource.SuccessHandle = function (data) {
                    self.ViewModel.FilterResult = data.DataList;
                    self.Pagination.TotalItens = data.Summary.Total;
                };

                self.ApiResource.EndPoint = self.GetConfigs().endPoint;
                self.ApiResource.Get();
            }

            function _pageChanged() {
                self.LastFilters.PageIndex = self.Pagination.CurrentPage;
                _load(self.LastFilters);
            }

            function _delete(model) {

                if (self.GetConfigs().Delete.pathModal == null)
                    throw "caminho do html do modal não enviado";

                self.LastAction = "delete";

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: self.GetConfigs().Delete.pathModal + "?v=" + _randomNum(),
                    controller: ExecuteDeleteNow,
                    controllerAs: 'vm',
                    resolve: {
                        model: function () {
                            return model;
                        }
                    }
                });
            };

            function _edit(id) {
                self.ApiResource = new Api.resourse(self.GetConfigs().resource);
                self.ApiResource.Filter.Id = id;

                self.ApiResource.SuccessHandle = function (data) {

                    if (self.GetConfigs().Edit.pathModal == null)
                        throw "caminho do html do modal não enviado";

                    self.LastAction = "edit";

                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: self.GetConfigs().Edit.pathModal + "?v=" + _randomNum(),
                        controller: ExecuteEditCreateNow,
                        size: self.GetConfigs().Edit.sizeModal,
                        controllerAs: 'vm',
                        resolve: {
                            model: function () {
                                return data.Data;
                            }
                        }
                    });

                    self.GetConfigs().Edit.onAfterRenderEdit(data.Data);
                };

                self.ApiResource.EndPoint = self.GetConfigs().endPoint;
                self.ApiResource.Get();
            };

            function _create() {

                if (self.GetConfigs().Create.pathModal == null)
                    throw "caminho do html do modal não enviado";

                self.LastAction = "create";

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: self.GetConfigs().Create.pathModal + "?v=" + _randomNum(),
                    controller: ExecuteEditCreateNow,
                    size: self.GetConfigs().Create.sizeModal,
                    controllerAs: 'vm',
                    resolve: {
                        model: function () {
                            return {};
                        }
                    }
                });
            };

            function _getConfigs() {
                return angular.merge({}, self.default, self.Config);
            };

            var ExecuteDeleteNow = function ($uibModalInstance, model, Notification) {

                var vm = this;

                vm.MensagemDeletar = self.GetConfigs().Delete.confirm;

                vm.ok = function () {

                    self.ApiResource = new Api.resourse(self.GetConfigs().resource);
                    self.ApiResource.Filter = model;

                    self.ApiResource.SuccessHandle = function (data) {
                        Notification.success({ message: self.GetConfigs().Delete.message, title: "Sucesso" })
                        $uibModalInstance.close();
                        _load(self.LastFilters);
                    };

                    self.ApiResource.EndPoint = self.GetConfigs().endPoint;
                    self.ApiResource.Delete();
                };

                vm.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            };

            var ExecuteEditCreateNow = function ($uibModalInstance, model, Notification) {
                var vm = this;

                vm.Model = model;
                vm.ActionTitle = self.LastAction == "create" ? "Cadastro" : "Edição";
                vm.ok = function (model) {

                    var msg = self.LastAction == "create" ? self.GetConfigs().Create.message : self.GetConfigs().Edit.message;

                    self.ApiResource = new Api.resourse(self.GetConfigs().resource);

                    model = self.GetConfigs().ChangeDataPost(model);
                    self.ApiResource.Data = model;

                    self.ApiResource.SuccessHandle = function (data) {
                        Notification.success({ message: msg, title: "Sucesso" })
                        $uibModalInstance.close();
                        _load(self.LastFilters);
                    };

                    self.ApiResource.EndPoint = self.GetConfigs().endPoint;
                    self.ApiResource.Post();
                };

                vm.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            };

        }

        this.start = function () {
            return new init();
        };
    };

})();