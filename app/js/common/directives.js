"use strict";

angular.module('app.common.directives', [])

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

        },
        link: function (scope, element, attrs) {

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
        link: function (scope, element, attrs, listController) {

          scope.selected = false;

          scope.close = function (event) {
            event.stopPropagation();
            listController.unselect(scope);
          }

          listController.addItem(scope);

          function handler(event) {
            event.preventDefault();
            event.stopPropagation();

            scope.$apply(function () {
              listController.select(scope);
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



