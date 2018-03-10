
app.controller("IpbanEditCtrl", ["$scope", "$http", "$filter", "$modalInstance",  "curr_data", "appCfg", function ($scope, $http, $filter, $modalInstance, curr_data, appCfg) {


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
		{"Key":"Ip", "Title":"屏蔽IP", "InputType":"text", "Required":"true"},
		{"Key":"Start", "Title":"开始时间", "InputType":"date", "Required":"true", "Id":"ipban_datetime_start","Format":"Y-m-d H:i"},
		{"Key":"End", "Title":"结束时间", "InputType":"date", "Required":"true", "Id":"ipban_datetime_end","Format":"Y-m-d H:i"},
		{"Key":"Description", "Title":"备　注", "InputType":"textarea"},
	];	
	
	/***********************初始化*****************************/	
	$scope.title= "添加屏蔽IP";
	$scope.postUrl = appCfg.AdminPrefix +"/ipban/add";

	$scope.op = curr_data.Op;
	$scope.oldData = angular.copy(curr_data.Data);
	$scope.editData = angular.copy($scope.oldData);


	if (curr_data.Op=='edit'){
		$scope.title= "编辑屏蔽IP";
		$scope.postUrl = appCfg.AdminPrefix +"/ipban/edit";
	}

}])
