(function () {
    'use strict';

    angular.module('common.utils')
        .directive('divPagination', function () {
            return {
                template: '<ul uib-pagination ' +
                    'ng-model="vm.crud.Pagination.CurrentPage" ' +
                    'ng-change="vm.crud.Pagination.PageChanged()" ' +
                    'max-size="vm.crud.Pagination.MaxSize" ' +
                    'items-per-page="vm.crud.Pagination.ItensPerPage" ' +
                    'total-items="vm.crud.Pagination.TotalItens" ' +
                    'previous-text="&laquo;" ' +
                    'next-text="&raquo;"></ul>'
            };
        })

        .directive('makeSelect', ['Api', function (Api) {
            return {
                replace: true,
                template: function (elem, attr) {

                    if (!attr.label)
                        attr.label = "Todas";

                    return '<select class="form-control" ' +
                                'ng-model="' + attr.model + '" ' +
                                'ng-options="item.Id as item.Name for item in vm.DataItem' + attr.dataitem + '">' +
                                '<option value="">' + attr.label + '</option> ' +
                           '</select>';
                },
                link: function (scope, element, attr) {
                    var api = new Api.resourse(attr.dataitem);
                    api.EnableLogs = false;
                    api.EnableLoading = false;
                    api.Filter.IsPaginate = false;
                    api.SuccessHandle = function (data) {
                        for (var i = 0; i < data.DataList.length; i++)
                            data.DataList[i].Id = parseInt(data.DataList[i].Id);
                        scope.vm["DataItem" + attr.dataitem] = data.DataList;

                    };
                    api.DataItem();
                }
            };
        }])

        .directive('makeDatepicker', ['$filter', function ($filter) {
            return {
                replace: true,
                require: 'ngModel',
                template: function (elem, attr) {
                    var identify = "datepicker" + parseInt(Math.random() * 1000);
                    return '<input type="text" ' +
                                'class="form-control" ' +
                                'is-open="' + identify + '" ' +
                                'ng-click="' + identify + ' = !' + identify + '" ' +
                                'readonly ' +
                                'uib-datepicker-popup="dd/MM/yyyy" ' +
                                'ng-model="' + attr.model + '" ' +
                                'placeholder="__/__/_____" ' +
                                'close-text="Fechar" ' +
                                'datepicker-options="{ language: \'pt\' }" ' +
                                'current-text="Hoje" ' +
                                'clear-text="Limpar" ' +
                                'ng-required="true" ' +
                                'ui-mask="__/__/____" ' +
                            '/>'
                },
                link: function (scope, element, attrs, ctrl) {
                    ctrl.$formatters.push(function (data) {
                        var val = $filter('date')(data, "dd/MM/yyyy")
                        ctrl.$setViewValue(val);
                        ctrl.$render();
                        return val;
                    });
                },
            };
        }])

        .directive('bindCustomValue', function () {
            return {
                restrict: 'A',
                template: function (elem, attr) {

                    var format = "";
                    var whiteSpaceBefore = true;
                    var whiteSpaceAfter = true;

                    if (attr.bindCustomType) {

                        if (attr.bindCustomType == "date")
                        { format = " | date:'dd/MM/yyyy' "; }

                        if (attr.bindCustomType == "money")
                        { format = " | currency "; attr.bindIfNull = "0" }

                        if (attr.bindCustomType == "integer")
                        { format = " | number:0 "; attr.bindIfNull = "0" }

                        if (attr.bindCustomType == "decimal")
                        { format = " | number:2 "; attr.bindIfNull = "0" }

                        if (attr.bindCustomType == "percent")
                        { format = " | number:2 "; attr.bindIfNull = "0"; attr.bindCustomAfter = "% " + (attr.bindCustomAfter || ""); whiteSpaceAfter = false; }

                    }

                    var html = (attr.bindCustomBefore ? attr.bindCustomBefore : "") + (whiteSpaceBefore ? ' ' : '') + // before content
                        '{{ ' + attr.bindCustomValue + ' || "' + (attr.bindIfNull || "--") + '"' + format + ' }}' + // the content
                        (whiteSpaceAfter ? ' ' : '') + (attr.bindCustomAfter ? attr.bindCustomAfter : "") +
                        (attr.bindContentAfter !== undefined ? elem.html() : ""); // after content

                    elem.html(html)

                    return elem[0][0];
                },
            };
        })

        .directive('bindBoolValue', function ($compile) {
            return {
                template: function (elem, attr) {
                    elem.attr("ng-class", "{ '" + (attr.bindClassIfTrue || "label-success") + "': " + attr.bindBoolValue + ", '" + (attr.bindClassIfFalse || "label-danger") + "': !" + attr.bindBoolValue + " }");
                    elem[0].textContent = '{{ ' + attr.bindBoolValue + ' ? "' + (attr.bindIfTrue || "Sim") + '" : "' + (attr.bindIfFalse || "Não") + '" }}';
                    return elem[0][0];
                },
                compile: function (elem) {
                    elem.removeAttr('bind-bool-value');
                    return {
                        post: function (scope, elem, attrs) {
                            $compile(elem)(scope);
                        }
                    }
                }
            };
        });
})();