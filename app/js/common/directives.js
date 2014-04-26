"use strict";

angular.module('app.common.directives', [])

    .directive('choices', function () {
      return {
        restrict: 'AE',
        scope: {
          choices: '=',
          caret: '@',
          index: '='
        },
        controller: function () {
        },
        link: function (scope) {

          if (!scope.index) {
            scope.index = 0;
          }

          scope.selected = {
            index: scope.index,
            text: scope.choices[scope.index]
          };

          scope.$watch('selected.index', function (value) {
            scope.index = value;
            scope.selected.text = scope.choices[value];
          });
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
            var autofocus =item.attr('focus');
            if (autofocus != undefined) {
              $timeout(function(){item[0].focus();});
            }
          });
        }
      }
    })

    .directive('listGroup', function () {
      return {
        restrict: 'AC',
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

    .directive('listGroupItem', function () {
      return {
        restrict: 'AC',
        require: '^listGroup',
        scope: true,
        controller: function ($scope, $element, $attrs) {
        },
        link: function (scope, element, attrs, listGroup) {

          scope.selected = false;

          scope.close = function (event) {
            event.stopPropagation();
            listGroup.unselect(scope);
          }

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



