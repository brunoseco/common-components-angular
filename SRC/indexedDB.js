
angular.module('common.utils')
    .service('DbIndexed', DbIndexed);

function DbIndexed($timeout) {

    var init = function () {

        this.Get = _get;
        this.Add = _add;
        this.Update = _update;
        this.Remove = _remove;
        this.CreateDB = _createdb;

        this.key = 0;
        this.data = {};

        this.SuccessHandle = function (data) { return data; };
        this.ErrorHandle = function (data) { return data; };

        this.result = {};

        this.objectStore = null;

        this.DbVersion = 1;
        this.DbName = null;
        this.Table = null;
        this.KeyPath = null;

        var self = this;

        function _get(chave) {

            _getDB().onsuccess = function (event) {

                var db = event.target.result;
                var transection = db.transaction([self.Table]);
                var objectStore = transection.objectStore(self.Table);

                var requestGet = objectStore.get(chave);

                requestGet.onsuccess = function (e) {
                    $timeout(function () {
                        return self.SuccessHandle(requestGet.result)
                    }, 1);
                };

                requestGet.onerror = function (e) {
                    return self.ErrorHandle(e)
                }
            };
        };

        function _add(item) {
            _getDB().onsuccess = function (event) {
                var db = event.target.result;
                var transection = db.transaction([self.Table], "readwrite");
                var objectStore = transection.objectStore(self.Table);
                objectStore.add(item);
            }
        };

        function _update() {
            _getDB().onsuccess = function (event) {
                var db = event.target.result;
                var transection = db.transaction([self.Table], "readwrite");
                var objectStore = transection.objectStore(self.Table);
                var requestUpdate = objectStore.get(self.key);

                requestUpdate.onsuccess = function (event) {
                    var dados = this.result;
                    dados = self.data;
                    var requestUpdate = objectStore.put(dados);
                };
            }
        };

        function _remove() {
            _getDB().onsuccess = function (event) {
                var db = event.target.result;
                var transection = db.transaction([self.Table], "readwrite");
                var objectStore = transection.objectStore(self.Table);
                objectStore.delete(self.key);
            }
        };

        function _createdb() {
            var response = indexedDB.open(self.DbName, self.DbVersion);
            response.onerror = function (event) {
            };

            response.onsuccess = function (event) {

            };

            response.onupgradeneeded = function (event) {
                var db = event.target.result;

                if (!self.KeyPath)
                    throw "KeyPath não definido";

                var objectStore = db.createObjectStore(self.Table, { keyPath: self.KeyPath });

                objectStore.transaction.oncomplete = function (event) {

                }
            };
        };

        function _getDB() {
            return indexedDB.open(self.DbName, self.DbVersion);
        }
    };

    this.start = function () {
        return new init();
    }


};