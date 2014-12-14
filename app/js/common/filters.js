angular.module('app.common.filters', [])

    .filter('priority', function () {
      return function (input) {
        switch (input) {
          case 0:
            return 'Low';
          case 1:
            return 'Medium';
          case 2:
            return 'High';
          case 3:
            return 'Critical';
        }
      };
    })

    .filter('groupBy', function () {
      return function (list, groupByField) {

        var filtered = [];
        var previousItem = null;
        var isGroupChange = false;
        var groupChangedField = 'groupChanged';

        angular.forEach(list, function (item) {
          isGroupChange = false;

          if (previousItem !== null) {
              if (!angular.equals(previousItem[groupByField], item[groupByField])) {
                isGroupChange = true;
              }
          }
          else {
            isGroupChange = true;
          }

          if (isGroupChange) {
            item[groupChangedField] = true;
          } else {
            item[groupChangedField] = false;
          }

          filtered.push(item);
          previousItem = item;
        });

        return filtered;
      };
    });