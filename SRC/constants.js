(function () {
    'use strict';

    angular
        .module("common.utils")
        .constant("endpoints", {
            DEFAULT: "http://localhost:5521/api",
            BI: "http://localhost:5521/api",
            CNABOXHOLDING: "http://localhost:57108/api",
            CNABOXACCESS: "http://localhost:5698/api",
        });

    angular
        .module("common.utils")
        .constant("configsConstants", {
            STATE_STATUSCODE_401: "Login",
        });

})();