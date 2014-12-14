'use strict';

angular.module('app', [

  'app.common.directives',
  'app.common.services',
  'app.common.filters',

  'app.tasks',

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

      $scope.filters = ['Today', 'Tomorrow', 'Next 7 days', 'All tasks', 'Done'];
      $scope.sorts = ['By Name', 'By Date', 'By Priority'];

      $scope.options = {
        filter: 3,
        sort: 1
      };

      $scope.alert = alert;
    });