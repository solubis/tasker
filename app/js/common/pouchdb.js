"use strict";

angular.module('app.common.pouchdb', [])

    .factory('Database', function ($q) {

      var _db,
          _pouch,
          _databaseName;

      var _promise = function (fn) {
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

      var _connect = function (databaseName, proxy) {
        var deferred = $q.defer();

        _databaseName = databaseName;

        new PouchDB(_databaseName)
            .then(function (pouch) {
              _pouch = pouch;
              _db = {
                id: _pouch.id,
                put: _promise(_pouch.put),
                post: _promise(_pouch.post),
                get: _promise(_pouch.get),
                remove: _promise(_pouch.remove),
                bulkDocs: _promise(_pouch.bulkDocs),
                allDocs: _promise(_pouch.allDocs),
                putAttachment: _promise(_pouch.putAttachment),
                getAttachment: _promise(_pouch.getAttachment),
                removeAttachment: _promise(_pouch.removeAttachment),
                query: _promise(_pouch.query),
                info: _promise(_pouch.info),
                compact: _promise(_pouch.compact),
                revsDiff: _promise(_pouch.revsDiff),
                changes: function (options) {
                  var clone;
                  clone = angular.copy(options);
                  clone.onChange = function (change) {
                    return $rootScope.$apply(function () {
                      return options.onChange(change);
                    });
                  };
                  return _pouch.changes(clone);
                }
              };
                deferred.resolve(proxy);
            })
            .catch(function (error) {
              deferred.reject(error);
            });

        return deferred.promise;

      };


      var Database = function (databaseName) {
        return _connect(databaseName, this);
      };

      Database.prototype.clean = function () {
        var deferred = $q.defer();

        console.log("Cleaning...");

        PouchDB.destroy(_databaseName, function (error) {
          if (error) {
            return deferred.reject(error);
          }

          console.log("Creating database...");

          _connect(_databaseName)
              .then(function (result) {
                return deferred.resolve(result);
              }).catch(function (error) {
                return deferred.reject(error);
              });

          console.log("Done creating database...");
        });

        return deferred.promise;
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