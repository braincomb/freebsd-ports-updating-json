var App = angular.module('App', ['loading', 'infinite-scroll', 'ui']);

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

  var itemsToShow = 10;
  $scope.scrollLimit = function() {
    return itemsToShow;
  };

  $scope.loadMore = function() {
    itemsToShow = itemsToShow + 10;
  };

});

App.filter('newlines', function () {
  return function(text) {
    return text.replace(/\n/g, '<br/>');
  }
});

App.filter('dates', function () {
  return function(text) {
    return text.replace(/^(\d{4})(\d{2})(\d{2})/g, "$1-$2-$3");
  }
});

App.filter('highlight', function () {
  return function (text, search, caseSensitive) {
    if (search || angular.isNumber(search)) {
      text = text.toString();
      search = search.toString();
      if (caseSensitive) {
        return text.split(search).join('<span class="ui-match">' + search + '</span>');
      } else {
        return text.replace(new RegExp(search, 'gi'), '<span class="ui-match">$&</span>');
      }
    } else {
      return text;
    }
  };
});
