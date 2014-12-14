"use strict";

angular.module('app.common.directives', [])

    .directive('choices', function () {
      return {
        restrict: 'AE',
        scope: {
          choices: '=',
          caret: '@',
          choice: '=',
          text: '@',
          onChoice: '&'
        },
        controller: function () {
        },
        link: function (scope, element, attrs) {
          scope.label = scope.text || scope.choices[scope.choice || 0];

          if (attrs.text) {
            attrs.$observe('text', function (value) {
              scope.label = value;
            });
          }

          scope.select = function (index) {
            var choice = scope.choices[index];

            if (scope.choice != undefined) {
              scope.choice = index;
            }

            scope.onChoice({choice: choice});

            scope.label = scope.text || choice;
          };
        },
        templateUrl: 'views/choices.tmpl.html'
      };
    })

    .directive('form', function ($timeout) {
      return {
        restrict: 'E',
        link: function (scope, element) {
          var inputs = element.find('input');
          angular.forEach(inputs, function (item) {
            item = angular.element(item);
            var autofocus = item.attr('focus');
            if (autofocus != undefined) {
              $timeout(function () {
                item[0].focus();
              });
            }
          });
        }
      }
    })

    .directive('list', function () {
      return {
        restrict: 'AE',
        controller: function () {
          var me = this;

          this.items = [];

          this.addItem = function (item) {
            me.items.push(item);
          };

          this.select = function (item) {
            for (var i = 0, length = me.items.length; i < length; i++) {
              me.items[i].selected = (me.items[i] === item);
            }
          };

          this.unselect = function (item) {
            item.selected = false;
          }
        }
      };
    })

    .directive('listItem', function () {
      return {
        restrict: 'AE',
        require: '^list',
        scope: true,
        controller: function ($scope, $element, $attrs) {
        },
        link: function (scope, element, attrs, listGroup) {
          scope.selectedIndex = false;

          scope.close = function (event) {
            event.stopPropagation();
            listGroup.unselect(scope);
          };

          listGroup.addItem(scope);

          function handler(event) {
            event.preventDefault();
            event.stopPropagation();

            scope.$apply(function () {
              listGroup.select(scope);
            });
          }

          scope.$watch('selected', function (value) {
                if (value) {
                  element.unbind('click', handler);
                } else {
                  element.bind('click', handler);
                }
              }
          );
        }
      }
    });



