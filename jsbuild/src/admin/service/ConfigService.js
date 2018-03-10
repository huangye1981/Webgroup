app.service('configService', ["$rootScope", "$http", "$filter", "appCfg", function($rootScope, $http, $filter, appCfg) {
    
    
	var self = this;
	
	this.data = {"Admin":[], "Role":[], "Mode":[], "Node":[]};
	
	this.getConfig = function(type) {
        var url = appCfg.AdminPrefix + "/public/config";
        if (angular.isDefined(type) && type != ""){
            url = appCfg.AdminPrefix + "/public/config/" + type;
        }
		
		
		return $http.get(url).success(function(data, status, headers, config) {
			if(data.Code==1) {
                 if (angular.isDefined(type) && type != ""){
                    self.data[type] = data.Data;
                 }else{
                     self.data = data.Data;
                 }
                
               
			} else {
				$filter("AlertError")(data.Msg);
			}
		});
	};

	this.getConfig();
}]);

