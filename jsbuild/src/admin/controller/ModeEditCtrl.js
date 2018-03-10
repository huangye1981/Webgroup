
app.controller("ModeEditCtrl", ["$scope", "$http", "$filter", "$modalInstance", "curr_data", "appCfg", "configService","LoginService", function ($scope, $http, $filter, $modalInstance, curr_data, appCfg, configService, LoginService) {

    
    $scope.cancel = function () {
    	$modalInstance.dismiss("cancel");
    };   
	
    $scope.reset = function() {
    	$scope.editData = angular.copy($scope.oldData);
    };
    
    $scope.change = function(attr) {
    	if (attr.length==0) {
    		for (var attr in $scope.editData) {
    			if (!$scope.oldData.hasOwnProperty(attr)) {
    				return true;
    			}
    			if ($scope.oldData[attr] != $scope.editData[attr]) {
            		return true;
            	}
    		}
        	return false;    		
    	} else {
			if (!$scope.oldData.hasOwnProperty(attr)) {
				return true;
			}
    		if ($scope.oldData[attr] != $scope.editData[attr]) {
        		return true;
        	}
        	return false;
    	}
    	return false;
    };
    
    $scope.save = function() {
 
		$http.post($scope.postUrl, $scope.editData).success(function(data, status, headers, config) {
			if($filter("CheckError")(data)){
				configService.getConfig("Mode");
                $modalInstance.close(data);
			} 
		});

    };

	/***********************数据定义*****************************/
	$scope.attrDef = [
			{"Key":"Type", "Title":"模块类型", "InputType":"radio", "Value":[[1,"项目模块"],[2,"系统模块"]]},	
			{"Key":"Name", "Title":"模块名称", "InputType":"text", "Required":"true"},
			{"Key":"Key", "Title":"模块别名", "InputType":"text", "Required":"true"},
			{"Key":"Sort", "Title":"模块排序", "InputType":"text-i", "Required":"true"},
			{"Key":"Description", "Title":"模块备注", "InputType":"textarea"},
	];	
	
	/***********************初始化*****************************/
	
	$scope.title= "添加模块";
	$scope.postUrl = appCfg.AdminPrefix +"/mode/add";

	$scope.op = angular.copy(curr_data.Op);
	$scope.oldData = angular.copy(curr_data.Data);
	$scope.editData = angular.copy($scope.oldData);

	if  ($scope.oldData["ParentId"] > 0 || $scope.oldData["Func"] == 1){
		$scope.attrDef = [
			{"Key":"Name", "Title":"模块名称", "InputType":"text", "Required":"true"},
			{"Key":"Key", "Title":"模块别名", "InputType":"text", "Required":"true"},
            {"Key":"Sort", "Title":"模块排序", "InputType":"text-i", "Required":"true"},
			{"Key":"Logs", "Title":"日志跟踪", "InputType":"radio", "Value":[[1,"跟踪"],[2,"不跟踪"]]},	
			{"Key":"Description", "Title":"模块备注", "InputType":"textarea"},
		];
	}
    
	if (curr_data.Op=='edit'){
		$scope.title= "编辑模块";
		$scope.postUrl = appCfg.AdminPrefix +"/mode/edit";
	}

}])
