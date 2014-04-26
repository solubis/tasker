'use strict';

angular.module('app.tasks', ['app.common.pouchdb'])

    .controller('TaskController', function ($scope, $db) {
      $scope.orderBy = '-priority';
      $scope.filterValue = 'today';
      $scope.filter = function (actual) {
        var today;

        today = new Date().getDate();

        if ($scope.filterValue) {
          switch ($scope.filterValue.toLowerCase()) {
            case 'all':
            {
              return true;
            }
            case 'today':
            {
              return actual.date !== today;
            }
          }
        }

        return true;
      };

      $scope.init = function () {
        $db.all()
            .then(function (result) {
              $scope.tasks = result;
            })
            .catch(function (error) {
              console.log('Error (' + error.name + ') : ' + error.message);
            });
      };

      $scope.create = function () {
        var record = $db.record;

        var promise = $db.create(record);

        promise
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
    })

    .controller('TaskItemController', function ($scope, $db) {
      $scope.selectedDate = 0;
      $scope.selectedRepeat = 0;
      $scope.selectedPriority = 0;

      $scope.dates = ['Today', 'Tomorrow', 'Next', 'Someday'];
      $scope.repeats = ['None', 'Every Day', 'Every Week', 'Every Month', 'Every Year'];
      $scope.priorities = ['Low', 'Medium', 'High', 'Critical'];
      $scope.hours = ['+1', '+2', '+4', '+8', '+10'];


      $scope.$watch('selected', function(value){
        if (!value){
          $scope.opened = false;
        }
      });

      $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
      };

      $scope.addHours = function(text){
        var add = parseInt(text.substr(1), 10);
        $scope.task.worked = $scope.task.worked + add;
      }

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

      $scope.update = function (event) {
        event.stopPropagation();

        $db.update($scope.task)
            .catch(function (error) {
              console.log('Error (' + error.name + ') : ' + error.message);
            });
      };

      $scope.$watch('task.priority', function(value){
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

        var promises = [];

        for (i = 0; i < 20; i++) {

          var promise = this.create({
            name: chance.pick(tasks),
            date: chance.date({string: false, american: false}),
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
    });
