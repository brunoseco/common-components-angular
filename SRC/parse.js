(function () {
    'use strict';

    angular
        .module('common.utils')
        .factory('JsonParseService', JsonParseService);

    JsonParseService.$inject = [];

    function JsonParseService() {
        var hashOfObjects = {};

        var service = {
            exec: exec
        };

        return service;

        function collectIds(obj) {
            if (typeof obj === "object") {
                if (obj.hasOwnProperty("$id")) {
                    hashOfObjects[obj.$id] = obj;
                }
                for (var prop in obj) {
                    collectIds(obj[prop]);
                }
            } else if (typeof obj === "array") {
                obj.forEach(function (element) {
                    collectIds(element);
                });
            }
        }

        function setReferences(obj) {
            if (typeof obj === "object") {
                for (var prop in obj) {
                    if (typeof obj[prop] === "object" &&
                        obj[prop].hasOwnProperty("$ref")) {
                        obj[prop] = hashOfObjects[obj[prop]["$ref"]];
                    } else {
                        setReferences(obj[prop]);
                    }
                }
            } else if (typeof obj === "array") {
                obj.forEach(function (element, index, array) {
                    if (typeof element === "object" &&
                        element.hasOwnProperty("$ref")) {
                        array[index] = hashOfObjects[element["$ref"]];
                    } else {
                        setReferences(element);
                    }
                });
            }
        }

        function setMaxDepth(obj, depth) {
            if (typeof obj !== "array" && typeof obj !== "object") {
                return obj;
            }

            var newObj = {};

            if (typeof obj === "array") {
                newObj = [];
            }

            angular.forEach(obj, function (value, key) {
                if (depth == 1) {
                    newObj = null;
                }
                else if (typeof value === "array") {
                    if (setMaxDepth(value, depth - 1)) {
                        newObj[key] = setMaxDepth(value, depth - 1)
                    } else {
                        newObj = [];
                    }
                } else if (typeof value === "object") {
                    if (setMaxDepth(value, depth - 1)) {
                        newObj[key] = setMaxDepth(value, depth - 1)
                    } else {
                        newObj = [];
                    }
                } else {
                    newObj[key] = value;
                }
            }, newObj);

            return newObj;
        }

        function exec(obj, depth) {
            var newObj = obj;

            hashOfObjects = {};
            collectIds(newObj);
            setReferences(newObj);

            if (depth) {
                newObj = setMaxDepth(newObj, depth);
            }

            return newObj;
        }
    }
})();