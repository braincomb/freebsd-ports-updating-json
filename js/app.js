var App = angular.module('App', ['loading']);

App.controller('DisplayController', function($scope, $http, $timeout) {
  $http.get('UPDATING.json').then(function(result){
    $scope.entries = result.data;
  });

  // bind filter
  $scope.filterText = '';

  var tempFilterText = '', filterTextTimeout;

  $scope.$watch('searchText', function (val) {
    if (filterTextTimeout) $timeout.cancel(filterTextTimeout);

    tempFilterText = val;
    filterTextTimeout = $timeout(function() {
      $scope.filterText = tempFilterText;
    }, 200)
  });

});

App.filter('newlines', function () {
  return function(text) {
    return text.replace(/\n/g, '<br/>');
  }
});
