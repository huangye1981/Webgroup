app.controller("LogsCtrl", ["$scope", "$http", "$filter", "appCfg",  "configService", "EzConfirm", function ($scope, $http, $filter, appCfg, configService, EzConfirm) {

    $scope.config = configService.data;
    
	 $scope.search = {
						Keyword:"",
						Start:"",
						PageSize:20,//单页条数
						Page:1,//默认当前页为第一页
					};



	//**************************************************************
	$scope.getList = function(page) {
		$scope.search.Page = page || $scope.search.Page;
		var url = appCfg.AdminPrefix + "/logs/list";
		$http.post(url, $scope.search).success(function(data, status, headers, config) {
			if ($filter("CheckError")(data)){
				$scope.listData= data.Data;
			}
		});	
	};
    

	$scope.clear = function(){
		EzConfirm.create({heading: '日志清除', text: '确定清除全部日志吗？'}).then(function() {
        	$http.get(appCfg.AdminPrefix + '/logs/clear').success(function(data, status, headers, config) {
				$scope.getList(1);
			});
        });
	};

	$scope.getList($scope.currentPage);
}])