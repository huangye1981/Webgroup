
app.config( ["$routeProvider", function ($routeProvider) {
	
	$routeProvider.when('/start', {
		templateUrl: '/static/page/app/domain_list.html',
		controller: "FilesListCtrl"
	});

	$routeProvider.when('/files/list', {
		templateUrl: '/static/page/app/files_list.html',
		controller: "FilesListCtrl"
	});

	$routeProvider.when('/domain/list', {
		templateUrl: '/static/page/app/domain_list.html',
		controller: "DomainListCtrl"
	});

}]);
