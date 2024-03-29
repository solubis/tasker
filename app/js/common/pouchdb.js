"use strict";

angular.module('app.common.pouchdb', [])

    .factory('Database', function ($q) {

      var _db,
          _databaseName;

      var Database = function (databaseName) {
        _databaseName = databaseName;
        _db = new PouchDB(_databaseName);
      };

      Database.prototype.clean = function () {
        return $q.when(PouchDB.destroy(_databaseName))
            .then(function () {
              _db = new PouchDB(_databaseName);
            })
      };

      Database.prototype.all = function () {
        var options = {
          include_docs: true
        };

        return $q.when(_db.allDocs(options))
            .then(function (result) {
              var converted;

              converted = result.rows.map(function (element) {
                return element.doc;
              });

              return converted;
            });
      };

      Database.prototype.get = function (obj) {
        var _id = (typeof obj === 'object' ? obj.id : obj);

        return $q.when(_db.get(_id));
      };

      Database.prototype.create = function (record) {
        return $q.when(_db.post(record))
            .then(function (result) {
              return _db.get(result.id);
            });
      };

      Database.prototype.update = function (record) {
        return $q.when(_db.put(record))
            .then(function (result) {
              record._rev = result.rev;
            });
      };

      Database.prototype.remove = function (record) {
        return $q.when(_db.remove(record));
      };

      return Database;
    });