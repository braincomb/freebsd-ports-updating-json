var App = angular.module('App', ['loading']);
 
App.controller('DisplayController', function($scope, $http, $timeout) {
	$http.get('UPDATING.json').then(function(result){
		$scope.entries = result.data;
	});
});

App.filter('newlines', function () {
    return function(text) {
        return text.replace(/\n/g, '<br/>');
    }
});
