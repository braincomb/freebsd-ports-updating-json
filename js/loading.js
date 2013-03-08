var mod = angular.module('loading', []);

mod.factory('loadingService', function() {
  var service = {
    requestCount: 0,
    isLoading: function() {
      return service.requestCount > 0;
    }
  };
  return service;
});

mod.factory('onStartInterceptor', function(loadingService) {
  return function (data, headersGetter) {
    loadingService.requestCount++;
    return data;
  };
});

// This is just a delay service for effect!
mod.factory('delayedPromise', function($q, $timeout){
  return function(promise, delay) {
    var deferred = $q.defer();
    var delayedHandler = function() {
      $timeout(function() { deferred.resolve(promise); }, delay);
    };
    promise.then(delayedHandler, delayedHandler);
    return deferred.promise;
  };
});

mod.factory('onCompleteInterceptor', function(loadingService, delayedPromise) {
  return function(promise) {
    var decrementRequestCount = function(response) {
      loadingService.requestCount--;
      return response;
    };
    // Normally we would just chain on to the promise...
    // return promise.then(decrementRequestCount, decrementRequestCount);
    // ...but we are delaying the response by N secs to allow the loading to be seen.
    return delayedPromise(promise, 0).then(decrementRequestCount, decrementRequestCount);
  };
});

mod.config(function($httpProvider) {
  $httpProvider.responseInterceptors.push('onCompleteInterceptor');
});

mod.run(function($http, onStartInterceptor) {
  $http.defaults.transformRequest.push(onStartInterceptor);
});

mod.controller('LoadingController', function($scope, loadingService) {
  $scope.$watch(function() { return loadingService.isLoading(); }, function(value) { $scope.loading = value; });
});