
app.controller("RoleEditCtrl", ["$scope", "$http", "$filter", "$modalInstance", "curr_data", "appCfg", function ($scope, $http, $filter, $modalInstance, curr_data, appCfg) {

    
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
			if ($filter("CheckError")(data)){
				$modalInstance.close(data);
			}
		});

    };
	/***********************数据定义*****************************/
	$scope.attrDef = [
		  {"Key":"Name", "Title":"名称", "InputType":"text", "Required":"true"},
          {"Key":"Description", "Title":"备注", "InputType":"textarea"},
	];	
	
	/***********************初始化*****************************/	
	$scope.title= "添加角色";
	$scope.postUrl = appCfg.AdminPrefix +"/role/add";

	$scope.op = curr_data.Op;
	$scope.oldData = angular.copy(curr_data.Data);
	$scope.editData = angular.copy($scope.oldData);


	if (curr_data.Op=='edit'){
		$scope.title= "编辑角色";
		$scope.postUrl = appCfg.AdminPrefix +"/role/edit";
	}

}])

