'use strict';

angular.module('app.tasks', ['app.common.pouchdb'])

    .controller('TaskListController', function ($scope, $db) {
      $scope.init = function () {
        $db.all()
            .then(function (result) {
              $scope.tasks = $scope.original = result; // TODO filtering?
            })
            .catch(function (error) {
              console.log('Error (' + error.name + ') : ' + error.message);
            });
      };

      $scope.create = function () {
        var record = $db.record;

        $db.create(record)
            .then(function (record) {
              $scope.tasks.unshift(record);
            })
            .catch(function (error) {
              console.log('Error (' + error.name + ') : ' + error.message);
            });
      };

      $scope.populate = function () {
        $db.clean()
            .then(function () {
              return $db.populate();
            })
            .then(function (result) {
              $scope.tasks = result;
            })
            .catch(function (error) {
              console.log('Error (' + error.name + ') : ' + error.message);
            });
      };

      $scope.$on('addTask', $scope.create);
      $scope.$on('populateDatabase', $scope.populate);

      $scope.$watch('options.sort', function (value) {
        switch (value) {
          case 0:
            $scope.selectedOrder = '+name';
            break;
          case 1:
            $scope.selectedOrder = '+date';
            break;
          case 2:
            $scope.selectedOrder = '-priority';
            break;
        }

        $scope.groupField = $scope.selectedOrder.substr(1);
      });

      $scope.$watch('options.filter', function setFilter(value) {
        $scope.selectedFilter = value;
      });
    })

    .controller('TaskItemController', function ($scope, $db, $filter) {
      $scope.selectedDate = 0;
      $scope.selectedRepeat = 0;
      $scope.selectedPriority = 0;

      $scope.dates = ['Today', 'Tomorrow', 'Next', 'Someday'];
      $scope.repeats = ['None', 'Every Day', 'Every Week', 'Every Month', 'Every Year'];
      $scope.priorities = ['Low', 'Medium', 'High', 'Critical'];
      $scope.hours = ['+1', '+2', '+4', '+8', '+10'];

      //TODO otwarcie datepickera poprzez ustawienie zmiennej w scope controllera?

      $scope.$watch('selected', function (value) {
        if (!value) {
          $scope.datepickerPopupIsOpen = false;
        } else {
          $scope.formData = angular.copy($scope.task);
        }
      });

      $scope.openDatepickerPopup = function (event) {
        event.preventDefault();
        event.stopPropagation();

        $scope.datepickerPopupIsOpen = true;
      };

      $scope.groupHeader = function(){
        switch($scope.groupField){
          case 'priority':
            return $scope.priorities[$scope.task.priority];
          case 'date':
            return $filter('date')($scope.task.date, 'dd MMMM yyyy');
          case 'name':
            return $scope.task.name;
        }
      };

      $scope.addHours = function (text) {
        var add = parseInt(text.substr(1), 10);
        $scope.formData.worked = $scope.formData.worked + add;
      };

      $scope.remove = function (event, index) {
        event.stopPropagation();

        $db.remove($scope.task)
            .then(function () {
              $scope.tasks.splice(index, 1);
            })
            .catch(function (error) {
              console.log('Error (' + error.name + ') : ' + error.message);
            });
      };

      $scope.complete = function(event){
        event.preventDefault();
        event.stopPropagation();

        $scope.task.done = !$scope.task.done;
      };

      $scope.update = function (event) {
        event.stopPropagation();

        $db.update($scope.formData)
            .then(function () {
              angular.copy($scope.formData, $scope.task);
            })
            .catch(function (error) {
              console.log('Error (' + error.name + ') : ' + error.message);
            });
      };

      // TODO Stripe refaktoring

      $scope.$watch('task.priority', function (value) {
        var color;

        switch (value) {
          case 0:
            color = 'white';
            break;
          case 1:
            color = 'rgba(17,120,200,1)';
            break;
          case 2:
            color = '#ca5b45';
            break;
          default:
            color = 'white';
        }

        $scope.stripe = {'background-color': color};
      });

    })

    .factory('$db', function ($q, Database) {
      var $db = new Database('tasks');

      $db.populate = function () {
        var i,
            tasks = [
              'Opis scope i transclude',
              'Przywieźć drążek do podciągania z garażu',
              'Responsive tasker - Bootstrap, Everlive, Firebase'
            ];

        var promises = [], today = new Date();

        for (i = 0; i < 100; i++) {

          var promise = this.create({
            name: chance.pick(tasks),
            date: chance.date({year: 2014, month: today.getMonth(), hour:0, minute:0, second:0, millisecond:0, string: false, american: false}),
            priority: chance.integer({min: 0, max: 2}),
            worked: chance.integer({min: 0, max: 999}),
            toComplete: chance.integer({min: 0, max: 999}),
            repeat: chance.integer({min: 0, max: 3})
          });

          promises.push(promise);
        }

        return $q.all(promises);
      };

      $db.record = {
        name: 'New task',
        date: new Date(),
        priority: 0,
        worked: 0,
        toComplete: 0
      };

      return $db;
    })

    .filter('taskDateFilter', function () {
      return function (items, value) {
        var today,
            tomorrow,
            yesterday,
            week,
            filteredItems;

        if (!items) {
          return [];
        }

        today = new Date();
        today.setHours(23);
        today.setMinutes(59);
        today.setSeconds(59);

        tomorrow = new Date(today.valueOf());
        yesterday = new Date(today.valueOf());
        week = new Date(today.valueOf());

        tomorrow.setDate(today.getDate() + 1);
        yesterday.setDate(today.getDate() - 1);
        week.setDate(today.getDate() + 7);

        filteredItems = items.filter(function (item) {
          var time;

          if (!item.date){
            return value === 3;
          }

          time = item.date.getTime();

          switch (value) {
            case 0:
              return yesterday.getTime() < time && time <= today.getTime();
            case 1:
              return yesterday.getTime() < time && time <= tomorrow.getTime();
            case 2:
              return yesterday.getTime() < time && time <= week.getTime();
            default:
              return true;
          }
        });

        return filteredItems;
      };
    });

