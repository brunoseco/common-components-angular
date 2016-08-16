(function () {
    'use strict';

    angular.module('common.utils')
        .config(function (NotificationProvider) {
            NotificationProvider.setOptions({
                delay: 5000,
                startTop: 20,
                startRight: 10,
                verticalSpacing: 20,
                horizontalSpacing: 20,
                positionX: 'right',
                positionY: 'top'
            });
        });

})();