
app.controller("NodeEditCtrl", ["$scope", "$http", "$filter", "$modalInstance", "curr_data", "appCfg", "configService", "LoginService", function ($scope, $http, $filter, $modalInstance, curr_data, appCfg, configService, LoginService) {
    
	
    
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
				configService.getConfig("Node");
                LoginService.reLogin();
                $modalInstance.close(data);
			} 
		});

    };

	/***********************数据定义*****************************/
	$scope.attrDef = [
			{"Key":"Name", "Title":"节点名称", "InputType":"text"},
			{"Key":"Icon", "Title":"Icon图标", "InputType":"text"},
			{"Key":"Sort", "Title":"排序编号", "InputType":"text"},
			{"Key":"Description", "Title":"备注说明", "InputType":"textarea","Value":{"Rows":4}},
	];	
	
	/***********************初始化*****************************/
	
	$scope.title= "添加节点";
	$scope.postUrl = appCfg.AdminPrefix +"/node/add";

	$scope.op = angular.copy(curr_data.Op);
	$scope.oldData = angular.copy(curr_data.Data);
	$scope.editData = angular.copy($scope.oldData);

	if  ($scope.oldData["ParentId"] > 0 ){
		$scope.attrDef = [
			{"Key":"Name", "Title":"节点名称", "InputType":"text"},
			{"Key":"Url", "Title":"链接地址", "InputType":"text"},
			{"Key":"Sort", "Title":"排序编号", "InputType":"text"},
			{"Key":"Description", "Title":"备注说明", "InputType":"textarea","Value":{"Rows":4}},
		];
	}
    
	if (curr_data.Op=='edit'){
		$scope.title= "编辑节点";
		$scope.postUrl = appCfg.AdminPrefix +"/node/edit";
	}

}])
