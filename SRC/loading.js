(function () {
    'use strict';

    angular.module('common.utils')
        .factory('Loading', Loading);

    Loading.$inject = ['$rootScope'];

    function Loading($rootScope) {

        return {
            show: _show,
            hide: _hide
        }

        function _show() {
            $rootScope.loading = true;
        }

        function _hide() {
            $rootScope.loading = false;
        }

    };

})();