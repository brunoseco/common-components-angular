(function () {
    'use strict';

    angular.module('common.utils')
        .service('Crud', Crud);

    Crud.$inject = ['Api', '$uibModal', '$location', 'compatibilityConstants'];

    function Crud(Api, $uibModal, $location, compatibilityConstants) {

        var init = function () {

            this.default = {
                resource: null,
                endPoint: "DEFAULT",
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
                    urlRedirect: null
                },
                Edit: {
                    message: "Registro alterado com sucesso!",
                    pathModal: null,
                    sizeModal: null,
                    onAfterRenderEdit: function (model) { return model; },
                    urlRedirect: null
                },
                Details: {
                    pathModal: null,
                    sizeModal: null,
                    onAfterRenderDetails: function (model) { return model; },
                },
                Delete: {
                    message: "Registro excluir com sucesso!",
                    confirm: "Tem certeza que deseja excluir este registro?",
                    pathModal: "view/shared/_exclusao.modal.html",
                },
                Execute: {
                    message: "Operação realizada com sucesso!",
                    confirm: "Tem certeza que deseja realizar essa operação?",
                    pathModal: "view/shared/_execute.modal.html",
                    urlRedirect: null
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
            this.EditByFilter = _editByFilter;
            this.ConfigInPage = _configInPage;
            this.Details = _details;
            this.DetailsByFilter  = _detailsByFilter;
            this.Execute = _execute;
            this.ExecuteWithOutConfirmation = _executeWithOutConfirmation;
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
                    compatibilityConstants.SuccessHandleAPI(data,self);
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
                        controller: ExecuteEditCreateNowModal,
                        size: self.GetConfigs().Edit.sizeModal,
                        controllerAs: 'vm',
                        resolve: {
                            labels: function () {
                                return self.GetConfigs().Labels;
                            },
                            attributes: function () {
                                return self.GetConfigs().Attributes;
                            },
                            model: function () {
                                return compatibilityConstants.GetDataAPI(data);
                            }
                        }
                    });

                    self.GetConfigs().Edit.onAfterRenderEdit(compatibilityConstants.GetDataAPI(data));
                };

                self.ApiResource.EndPoint = self.GetConfigs().endPoint;
                self.ApiResource.Get();
            };

            function _editByFilter(filter) {
                
                console.log('EditByFilter', filter);

                self.ApiResource = new Api.resourse(self.GetConfigs().resource);
                self.ApiResource.Filter = filter;

                self.ApiResource.SuccessHandle = function (data) {

                    if (self.GetConfigs().Edit.pathModal == null)
                        throw "caminho do html do modal não enviado";

                    self.LastAction = "edit";

                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: self.GetConfigs().Edit.pathModal + "?v=" + _randomNum(),
                        controller: ExecuteEditCreateNowModal,
                        size: self.GetConfigs().Edit.sizeModal,
                        controllerAs: 'vm',
                        resolve: {
                            labels: function () {
                                return self.GetConfigs().Labels;
                            },
                            attributes: function () {
                                return self.GetConfigs().Attributes;
                            },
                            model: function () {
                                return compatibilityConstants.GetDataListAPI(data)[0];
                            }
                        }
                    });

                    self.GetConfigs().Edit.onAfterRenderEdit(compatibilityConstants.GetDataListAPI(data)[0]);
                };

                self.ApiResource.EndPoint = self.GetConfigs().endPoint;
                self.ApiResource.Get();
            };

            function _configInPage($stateParams, vm, Notification) {

                self.ApiResource = new Api.resourse(self.GetConfigs().resource);
                self.ApiResource.Filter.Id = $stateParams.Id;

                self.ApiResource.SuccessHandle = function (data) {

                    vm.Model = compatibilityConstants.GetDataAPI(data);
                    self.GetConfigs().Edit.onAfterRenderEdit(compatibilityConstants.GetDataAPI(data));

                    ExecuteEditCreateNow(vm, Notification, function () {

                        if (self.GetConfigs().Edit.urlRedirect != null)
                            $location.path(self.GetConfigs().Edit.urlRedirect)

                        if (self.GetConfigs().Create.urlRedirect != null)
                            $location.path(self.GetConfigs().Create.urlRedirect)

                    });

                };

                self.ApiResource.EndPoint = self.GetConfigs().endPoint;
                self.ApiResource.Get();
            };

            function _details(id) {

                self.ApiResource = new Api.resourse(self.GetConfigs().resource);
                self.ApiResource.Filter.Id = id;

                self.ApiResource.SuccessHandle = function (data) {

                    if (self.GetConfigs().Details.pathModal == null)
                        throw "caminho do html do modal não enviado";

                    self.LastAction = "details";

                    var modalInstance = $uibModal.open({
                        animation: true,
                        controller: ExecuteDetailsNow,
                        templateUrl: self.GetConfigs().Details.pathModal + "?v=" + _randomNum(),
                        size: self.GetConfigs().Details.sizeModal,
                        controllerAs: 'vm',
                        resolve: {
                            labels: function () {
                                return self.GetConfigs().Labels;
                            },
                            attributes: function () {
                                return self.GetConfigs().Attributes;
                            },
                            model: function () {
                                return compatibilityConstants.GetDataAPI(data);
                            }
                        }
                    });

                    self.GetConfigs().Details.onAfterRenderDetails(compatibilityConstants.GetDataAPI(data));



                };

                self.ApiResource.EndPoint = self.GetConfigs().endPoint;
                self.ApiResource.Get();
            };

            function _detailsByFilter(filter) {

                self.ApiResource = new Api.resourse(self.GetConfigs().resource);
                self.ApiResource.Filter = filter;

                self.ApiResource.SuccessHandle = function (data) {

                    if (self.GetConfigs().Details.pathModal == null)
                        throw "caminho do html do modal não enviado";

                    self.LastAction = "details";

                    var modalInstance = $uibModal.open({
                        animation: true,
                        controller: ExecuteDetailsNow,
                        templateUrl: self.GetConfigs().Details.pathModal + "?v=" + _randomNum(),
                        size: self.GetConfigs().Details.sizeModal,
                        controllerAs: 'vm',
                        resolve: {
                            labels: function () {
                                return self.GetConfigs().Labels;
                            },
                            attributes: function () {
                                return self.GetConfigs().Attributes;
                            },
                            model: function () {
                                return compatibilityConstants.GetDataListAPI(data)[0];
                            }
                        }
                    });

                    self.GetConfigs().Details.onAfterRenderDetails(compatibilityConstants.GetDataListAPI(data)[0]);



                };

                self.ApiResource.EndPoint = self.GetConfigs().endPoint;
                self.ApiResource.Get();
            };

            function _executeWithOutConfirmation(model, notification, callback) {

                self.LastAction = "execute";
                ExecuteNowWithOutConfirmation(model, notification, callback);

            };

            function _execute(model, callback) {

                if (self.GetConfigs().Execute.pathModal == null)
                    throw "caminho do html do modal não enviado";

                self.LastAction = "execute";

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: self.GetConfigs().Execute.pathModal + "?v=" + _randomNum(),
                    controller: ExecuteNow,
                    controllerAs: 'vm',
                    resolve: {
                        model: function () {
                            return model;
                        },
                        callback: function () {
                            return callback;
                        },
                    }
                });
            };

            function _create() {

                if (self.GetConfigs().Create.pathModal == null)
                    throw "caminho do html do modal não enviado";

                self.LastAction = "create";

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: self.GetConfigs().Create.pathModal + "?v=" + _randomNum(),
                    controller: ExecuteEditCreateNowModal,
                    size: self.GetConfigs().Create.sizeModal,
                    controllerAs: 'vm',
                    resolve: {
                        labels: function () {
                            return self.GetConfigs().Labels;
                        },
                        attributes: function () {
                            return self.GetConfigs().Attributes;
                        },
                        model: function () {
                            return {
                            };
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

            var ExecuteDetailsNow = function ($uibModalInstance, model, labels, attributes, Notification) {

                var vm = this;

                vm.Model = model;
                vm.Labels = labels;
                vm.Attributes = attributes;

                vm.ActionTitle = "Detalhes";

                vm.ok = function (model) {

                };

                vm.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };


            };

            var ExecuteEditCreateNow = function (vm, Notification, actionEnd) {

                vm.ok = function (model) {

                    var msg = self.LastAction == "create" ? self.GetConfigs().Create.message : self.GetConfigs().Edit.message;

                    self.ApiResource = new Api.resourse(self.GetConfigs().resource);

                    model = self.GetConfigs().ChangeDataPost(model);
                    self.ApiResource.Data = model;

                    self.ApiResource.SuccessHandle = function (data) {
                        Notification.success({ message: msg, title: "Sucesso" })
                        actionEnd();
                        _load(self.LastFilters);
                    };

                    self.ApiResource.EndPoint = self.GetConfigs().endPoint;
                    self.ApiResource.Post();
                };

                vm.cancel = function () {
                    actionEnd();
                };
            };

            var ExecuteEditCreateNowModal = function ($uibModalInstance, model, labels, attributes, Notification) {

                var vm = this;

                vm.Model = model;
                vm.Labels = labels;
                vm.Attributes = attributes;
           

                vm.openCalendar = function (e, vm, index) {
                    e.preventDefault();
                    e.stopPropagation();
                    vm[index] = true;
                };


                var subActionTitle = self.LastAction == "create" ? "Cadastro" : "Edição";
                vm.ActionTitle = subActionTitle;
                if (self.ViewModel != null)
                    vm.ActionTitle = self.ViewModel.ActionTitle + " : " + subActionTitle;

                ExecuteEditCreateNow(vm, Notification, function () {
                    $uibModalInstance.dismiss('cancel');
                });


            };

            var ExecuteNow = function ($uibModalInstance, model, Notification, callback) {

                var vm = this;
                vm.Model = model;

                vm.MensagemConfirm = self.GetConfigs().Execute.confirm;

                vm.ok = function () {

                    self.ApiResource = new Api.resourse(self.GetConfigs().resource);

                    model = self.GetConfigs().ChangeDataPost(model);
                    self.ApiResource.Data = model;

                    self.ApiResource.SuccessHandle = function (data) {

                        Notification.success({ message: self.GetConfigs().Execute.message, title: "Sucesso" })

                        if (callback != null)
                            callback();

                        $uibModalInstance.close();

                    };

                    self.ApiResource.EndPoint = self.GetConfigs().endPoint;
                    self.ApiResource.Put();
                };

                vm.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            };

            var ExecuteNowWithOutConfirmation = function (model, Notification, callback) {


                self.ApiResource = new Api.resourse(self.GetConfigs().resource);

                model = self.GetConfigs().ChangeDataPost(model);
                self.ApiResource.Data = model;

                self.ApiResource.SuccessHandle = function (data) {

                    Notification.success({ message: self.GetConfigs().Execute.message, title: "Sucesso" })

                    if (callback != null)
                        callback();
                };

                self.ApiResource.EndPoint = self.GetConfigs().endPoint;
                self.ApiResource.Put();


            };

        }

        this.start = function () {
            return new init();
        };
    };

})();