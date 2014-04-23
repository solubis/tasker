'use strict';

/* ToDo refactor to Controller As

 <!-- In Your Binding -->
 <div ng-controller="MyCtrl as ctrl">
 <span></span>
 </div>

 //In your route
 $routeProvider
 .when('/',{
 templateUrl: 'foo.html',
 controller: 'MyCtrl',
 controllerAs: 'ctrl'
 });


 // In controler
 var MyCtrl = function(){
 this.name = 'Techno Fattie';
 };

 app.controller('MyCtrl', MyCtrl);

 http://www.technofattie.com/2014/03/21/five-guidelines-for-avoiding-scope-soup-in-angular.html

 */

angular.module('app.tasks', ['app.common.pouchdb'])

    .controller('TaskController', function ($scope, $db) {

      $scope.dates = ['Today', 'Tomorrow', 'Next', 'Someday'];
      $scope.repeats = ['None', 'Every Day', 'Every Week', 'Every Month', 'Every Year'];
      $scope.priorities = ['Low', 'Medium', 'High', 'Critical'];
      $scope.hours = ['+1', '+2', '+4', '+8', '+10'];

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

        console.log('');

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
      var priority = $scope.task.priority,
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

      $scope.priorityStyle = {'background-color': color};

    })

    .factory('$db', function ($q, Database) {
      var $db = new Database('tasks');

      $db.populate = function () {
        var i,
            periods = ['year', 'month', 'week', 'day'],
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
            repeat: {
              period: chance.pick(periods),
              every: chance.integer({min: 1, max: 12})
            }
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
