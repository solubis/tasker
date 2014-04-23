'use strict';

angular.module('app', [

  'app.tasks',
  'app.common.directives',
  'app.common.services',
  'app.common.filters',

  'ngAnimate',

  'ui.router',
  'ui.bootstrap'
])
    .config(function ($urlRouterProvider, $stateProvider) {
      $urlRouterProvider.otherwise('/');

      $stateProvider
          .state('tasks', {
            url: '/',
            templateUrl: 'views/tasks.html'
          });
    })

    .run(function ($rootScope) {

      $rootScope.filters = [
        'Today',
        'Tomorrow',
        'Week',
        'All'
      ];

      $rootScope.sorts = [
        'By date',
        'By priority',
        'By name'
      ];

    });