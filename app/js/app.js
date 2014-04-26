'use strict';

angular.module('app', [

  'app.tasks',
  'app.common.directives',
  'app.common.services',
  'app.common.filters',

  'ngAnimate',
  'ngSanitize',

  'ui.bootstrap.datepicker',
  'ui.bootstrap.dropdownToggle',

  'ui.router'
])
    .config(function ($urlRouterProvider, $stateProvider, datepickerConfig) {
      $urlRouterProvider.otherwise('/');

      $stateProvider
          .state('tasks', {
            url: '/',
            templateUrl: 'views/tasks.html'
          });

      angular.extend(datepickerConfig, {
        showWeeks: false
      });
    })

    .run(function ($rootScope, alert) {
      var $scope = $rootScope;

      $scope.filters = ['Today', 'Tomorrow', 'All tasks'];
      $scope.sorts = ['Sort 1', 'Sort 2', 'Sort 3'];

      $scope.options = {
        filter: 1,
        sort: 2
      }

      $scope.alert = alert;
    });