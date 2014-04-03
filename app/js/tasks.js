'use strict';

angular.module('app.tasks', ['app.common.pouchdb'])

    .controller('TaskController', function ($scope, TaskDatabase) {
      var db = TaskDatabase;

      $scope.dates = ['Today', 'Tomorrow', 'Next', 'Someday'];
      $scope.repeats = ['None', 'Every Day', 'Every Week', 'Every Month', 'Every Year'];
      $scope.priorities = ['Low', 'Medium', 'High', 'Critical'];
      $scope.hours = ['+1', '+2', '+4', '+8', '+10'];

      $scope.load = function () {
        console.log("Loading...");

        db.all()
            .then(function (result) {
              $scope.tasks = result;
            });
      };

      $scope.create = function () {
        var record = db.empty();

        db.create(record)
            .then(function (record) {
              $scope.tasks.unshift(record);
            })
            .catch(function (error) {
              console.log('Error (' + error.name + ') : ' + error.message);
            });
      };

      $scope.initialize = function () {
        console.log('\nInitializing database...');

        db.clean()
            .then(function () {
              return db.populate();
            })
            .then(function (result) {
              $scope.$apply(function () {
                $scope.tasks = result;
              });
            })
            .catch(function (error) {
              console.log('Error (' + error.name + ') : ' + error.message);
              console.log(error.stack);
            });
      };
    })

    .controller('TaskItemController', function ($scope, TaskDatabase) {
      var db = TaskDatabase,
          priority = $scope.task.priority,
          color;

      switch (priority) {
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

      $scope.remove = function (event, index) {
        event.stopPropagation();

        db.remove($scope.task)
            .then(function () {
                $scope.tasks.splice(index, 1);
            });
      };

      $scope.update = function (event) {
        event.stopPropagation();

        db.update($scope.task);
      };

      $scope.priorityStyle = {'background-color': color};

    })

    .factory('TaskDatabase', function ($q, Database) {
      var i,
          db = new Database('tasks');

      db.populate = function () {
        var periods = ['year', 'month', 'week', 'day'],
            tasks = [
              'Opis scope i transclude',
              'Przywieźć drążek do podciągania z garażu',
              'Responsive tasker - Bootstrap, Everlive, Firebase'
            ];

        console.log("Populating...");

        var promises = [];

        for (i = 0; i < 20; i++) {

          var promise = db.create({
            name: chance.pick(tasks),
            date: chance.date({string: true, american: false}),
            priority: chance.integer({min: 0, max: 2}),
            worked: chance.integer({min: 0, max: 999}),
            toComplete: chance.integer({min: 0, max: 999}),
            repeat: {
              period: chance.pick(periods),
              every: chance.integer({min: 1, max: 12})
            }
          });

          promises.push(promise);
        }

        return $q.all(promises);
      };

      db.empty = function () {
        return {
          name: 'New task',
          date: new Date(),
          priority: 0,
          worked: 0,
          toComplete: 0
        }
      };

      return db;
    });


function PouchController($scope, Database) {

  $scope.todos = [];

  $scope.db = new Database('todos');

  $scope.db.all()
      .then(function (response) {
        $scope.load(response.rows);
      })
      .catch(function (error) {
        console.log(error);
      });

  $scope.load = function (todos) {
    for (var i = 0; i < todos.length - 1; i++) {
      var todo = todos[i];
      $scope.db.get(todo.id)
          .then(function (doc) {
            $scope.$apply(function () {
              $scope.todos.push(doc);
            });
          })
          .catch(function (error) {
            console.log(error);
          });
    }
  };

  $scope.add = function () {
    var newTodo = {
      text: $scope.todoText,
      done: false
    };
    $scope.todos.push(newTodo);
    $scope.todoText = '';
    $scope.db.create(newTodo);
  };

  $scope.update = function (todo) {
    $scope.db.update(todo);
  };

  $scope.remaining = function () {
    var count = 0;
    angular.forEach($scope.todos, function (todo) {
      count += todo.done ? 0 : 1;
    });
    return count;
  };

  $scope.clean = function () {
    var oldTodos = $scope.todos;
    $scope.todos = [];
    angular.forEach(oldTodos, function (todo) {
      if (!todo.done) {
        $scope.todos.push(todo);
      } else {
        $scope.remove(todo);
      }
    });
  };

  $scope.remove = function (todo) {
    $scope.db.get(todo._id)
        .then(function (doc) {
          return $scope.db.remove(doc);
        })
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
  };
}
