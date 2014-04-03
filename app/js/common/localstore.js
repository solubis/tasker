"use strict";

angular.module('app.common.localstore', ['angular-local-storage'])

    .factory('AccountService', function ($rootScope, $location, storage) {
      var service = {};

      service.logout = function (redirect) {
        $rootScope.user = null;
        storage.remove('user');

        if (redirect) {
          $location.path(redirect);
        }
      };

      service.loadProfile = function () {
        storage.bind($rootScope, 'user');
      };

      service.login = function (email, password) {
        var user = storage.get(email);

        if (user && user.password === password) {
          storage.bind($rootScope, 'user');
          $rootScope.user = user;
          $location.path('/');
        } else {
          console.log(JSON.stringify("Incorrect login"));
          $rootScope.showAlert("Incorrect login");
        }
      };

      service.signUp = function (name, email, password) {
        var user = {
          email: email,
          name: name,
          password: password
        };


        storage.set(email, user);
        service.login(email, password);
      };

      service.isLoggedIn = function () {
        return $rootScope.user;
      };

      service.loadProfile();

      return service;
    })

    .controller('AccountController', function ($rootScope, accountService) {

      this.email = null;
      this.password = null;
      this.user = null;
      this.service = accountService;

    })

    .factory('DataService', function ($rootScope, storage) {

      var dao = function (tableName) {
        this.tableName = tableName;
        this.identityName = tableName + 'Identity';

        this.bind($rootScope, this.tableName);
        this.bind($rootScope, this.identityName);

        this.data = $rootScope[this.tableName];
        this.identity = $rootScope[this.identityName];

        if (!this.data) {
          this.data = [];
          $rootScope[this.tableName] = this.data;
        }

        if (!this.identity) {
          this.identity = 0;
          $rootScope[this.identityName] = this.identity;
        }
      };

      dao.prototype.bind = function (scope, name) {
        storage.bind(scope, name, {
          defaultValue: [],
          storeName: this.tableName
        });
      };

      dao.prototype.all = function () {
        return $rootScope[this.tableName];
      };

      dao.prototype.getNextId = function () {
        return ++this.identity;
      };

      dao.prototype.find = function (id) {
        var i, record;

        for (i = 0; i < this.data.length; i++) {
          record = this.data[i];
          if (record.Id === parseInt(id, 10)) {
            return this.data[i];
          }
        }

        return null;
      };

      dao.prototype.indexOf = function (id) {
        var i;

        for (i = 0; i < this.data.length; i++) {
          if (this.data[i].Id === parseInt(id, 10)) {
            return i;
          }
        }

        return -1;
      };

      dao.prototype.create = function (record, callback) {
        record.Id = this.getNextId();
        this.data.push(record);
        if (typeof callback === "function") {
          callback();
        }
      };

      dao.prototype.update = function (record, callback) {

        var recordToUpdate = this.find(record.Id);

        if (recordToUpdate) {
          angular.copy(record, recordToUpdate);
          if (typeof callback === "function") {
            callback();
          }
        }
      };

      dao.prototype.remove = function (id, callback) {
        var index = this.indexOf(id);

        if (0 <= index) {
          this.data.splice(index, 1);
        }

        if (typeof callback === "function") {
          callback();
        }
      };

      storage.clearAll();

      return dao;
    });


angular.module('angular-local-storage', [])
    .factory('storage', ['$parse', '$window', '$log', function ($parse, $window, $log) {
      /**
       * Global Vars
       */
      var storage, isChrome;

      isChrome = (typeof chrome !== 'undefined') && (typeof chrome.storage !== 'undefined');

      console.log("chrome " + isChrome);

      storage = isChrome ? chrome.storage.local : ((typeof $window.localStorage === 'undefined') ? undefined : $window.localStorage);


      var privateMethods = {
        /**
         * Pass any type of a string from the localStorage to be parsed so it returns a usable version (like an Object)
         * @param res - a string that will be parsed for type
         * @returns {*} - whatever the real type of stored value was
         */
        parseValue: function (res) {
          var val;
          try {
            val = $window.JSON.parse(res);
            if (typeof val === 'undefined') {
              val = res;
            }
            if (val === 'true') {
              val = true;
            }
            if (val === 'false') {
              val = false;
            }
            if ($window.parseFloat(val) === val && !angular.isObject(val)) {
              val = $window.parseFloat(val);
            }
          } catch (e) {
            val = res;
          }
          return val;
        }
      };

      var publicMethods = {
        /**
         * Set - let's you set a new localStorage key pair set
         * @param key - a string that will be used as the accessor for the pair
         * @param value - the value of the localStorage item
         * @returns {*} - will return whatever it is you've stored in the local storage
         */
        set: function (key, value) {
          var saver = $window.JSON.stringify(value), object = {};
          if (isChrome) {
            object[key] = saver;
            storage.set(object);
          } else {
            storage.setItem(key, saver);
          }
          return privateMethods.parseValue(saver);
        },

        /**
         * Get - let's you get the value of any pair you've stored
         * @param key - the string that you set as accessor for the pair
         * @returns {*} - Object,String,Float,Boolean depending on what you stored
         */
        get: function (key) {
          var item;

          if (isChrome) {
            storage.get(key, function () {

            });
          } else {
            item = storage.getItem(key);
            if (typeof callback === "function") {
              callback(privateMethods.parseValue(item));
            } else {
              return privateMethods.parseValue(item);
            }

          }
        },

        /**
         * Remove - let's you nuke a value from localStorage
         * @param key - the accessor value
         * @returns {boolean} - if everything went as planned
         */
        remove: function (key) {
          if (isChrome) {
            storage.remove(key);
          } else {
            storage.removeItem(key);
          }
          return true;
        },

        /**
         * Bind - let's you directly bind a localStorage value to a $scope variable
         * @param {Angular $scope} $scope - the current scope you want the variable available in
         * @param {String} key - the name of the variable you are binding
         * @param {Object} opts - (optional) custom options like default value or unique store name
         * Here are the available options you can set:
         * * defaultValue: the default value
         * * storeName: add a custom store key value instead of using the scope variable name
         * @returns {*} - returns whatever the stored value is
         */
        bind: function ($scope, key, opts) {
          var defaultOpts = {
            defaultValue: '',
            storeName: ''
          };
          // Backwards compatibility with old defaultValue string
          if (angular.isString(opts)) {
            opts = angular.extend({}, defaultOpts, {defaultValue: opts});
          } else {
            // If no defined options we use defaults otherwise extend defaults
            opts = (angular.isUndefined(opts)) ? defaultOpts : angular.extend(defaultOpts, opts);
          }

          // Set the storeName key for the localStorage entry
          // use user defined in specified
          var storeName = opts.storeName || key;

          // If a value doesn't already exist store it as is
          if (!publicMethods.get(storeName, function () {
          })) {
            publicMethods.set(storeName, opts.defaultValue);
          }

          // If it does exist assign it to the $scope value
          $parse(key).assign($scope, publicMethods.get(storeName, function () {
          }));

          // Register a listener for changes on the $scope value
          // to update the localStorage value
          $scope.$watch(key, function (val) {
            if (angular.isDefined(val)) {
              publicMethods.set(storeName, val);
            }
          }, true);
        },
        /**
         * Unbind - let's you unbind a variable from localStorage while removing the value from both
         * the localStorage and the local variable and sets it to null
         * @param $scope - the scope the variable was initially set in
         * @param key - the name of the variable you are unbinding
         * @param storeName - (optional) if you used a custom storeName you will have to specify it here as well
         */
        unbind: function ($scope, key, storeName) {
          storeName = storeName || key;
          $parse(key).assign($scope, null);
          $scope.$watch(key, function () {
          });
          publicMethods.remove(storeName);
        },
        /**
         * Clear All - let's you clear out ALL localStorage variables, use this carefully!
         */
        clearAll: function () {
          storage.clear();
        }
      };
      return publicMethods;
    }]);

