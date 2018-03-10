app.service('typeService', ["$rootScope", "$http", "$filter", "appCfg", function($rootScope, $http, $filter,  appCfg) {
	var self = this;
	
	this.data = {
			"Items":[]
	};
	
	this.getList = function() {
		var url = appCfg.AppPrefix + "/apppub/type";
		
		$http.get(url).success(function(data, status, headers, config) {
			if($filter("CheckError")(data)){
				self.data.Items = data.Data;
			}
		})
		.error(function(data, status, headers, config) {
			
		});
	};
	
	this.getList();
}]);

