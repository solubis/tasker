"use strict";

angular.module('app.common.pouchdb', [])

    .factory('Database', function ($q) {

      var _db,
          _pouch,
          _databaseName;

      var toPromise = function (fn) {
        return function () {
          var args,
              callback,
              deferred;

          deferred = $q.defer();

          callback = function (err, res) {
              if (err) {
                return deferred.reject(err);
              } else {
                return deferred.resolve(res);
              }
          };

          args = arguments != null ? Array.prototype.slice.call(arguments) : [];
          args.push(callback);
          fn.apply(_pouch, args);

          return deferred.promise;
        };
      };

      var _config = function(databaseName){
        _databaseName = databaseName;
        _pouch = new PouchDB(_databaseName);

        _db = {
          id: _pouch.id,
          put: toPromise(_pouch.put),
          post: toPromise(_pouch.post),
          get: toPromise(_pouch.get),
          remove: toPromise(_pouch.remove),
          bulkDocs: toPromise(_pouch.bulkDocs),
          allDocs: toPromise(_pouch.allDocs),
          changes: function(options) {
            var clone;
            clone = angular.copy(options);
            clone.onChange = function(change) {
              return $rootScope.$apply(function() {
                return options.onChange(change);
              });
            };
            return _pouch.changes(clone);
          },
          putAttachment: toPromise(_pouch.putAttachment),
          getAttachment: toPromise(_pouch.getAttachment),
          removeAttachment: toPromise(_pouch.removeAttachment),
          query: toPromise(_pouch.query),
          info: toPromise(_pouch.info),
          compact: toPromise(_pouch.compact),
          revsDiff: toPromise(_pouch.revsDiff)
        };

        return _db;
      };


      var Database = function (databaseName) {
        _db = _config(databaseName);
      };

      Database.prototype.clean = function () {

        console.log("Cleaning...");

        return PouchDB.destroy(_databaseName)
            .then(function () {

              console.log("Creating database...");

              _db = _config(_databaseName);
            });
      };

      Database.prototype.all = function () {
        var options = {
          include_docs: true
        };

        return _db.allDocs(options)
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

        return _db.get(_id);
      };

      Database.prototype.create = function (record) {
        return _db.post(record)
            .then(function (result) {
              return _db.get(result.id)
            });
      };

      Database.prototype.update = function (record) {
        return _db.put(record);
      };

      Database.prototype.remove = function (record) {
        return _db.remove(record);
      };

      return Database;
    });