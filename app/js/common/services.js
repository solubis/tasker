"use strict";

angular.module('app.common.services', ['toaster'])
    .service('alert', function (toaster) {
      this.info = function (text) {
        toaster.pop('info', 'Information', text, 1000, 'trustedHtml');
      }
    });