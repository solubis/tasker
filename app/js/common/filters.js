angular.module('app.common.filters', []).filter('priority', function() {
  return function(input) {
    switch (input){
      case 0: return 'Low';
      case 1: return 'Medium';
      case 2: return 'High';
      case 3: return 'High';
    }
  };
});