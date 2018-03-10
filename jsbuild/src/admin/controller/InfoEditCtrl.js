
app.controller("InfoEditCtrl", ["$scope", "$http", "$modalInstance", "$filter", "configService", "curr_data", "appCfg",  function ($scope, $http, $modalInstance, $filter, configService, curr_data, appCfg) {
    

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

		var post = angular.copy($scope.editData);
		
		temp = [];
		for (var i in post["Role"]){
			var role_obj = array_obj_find($scope.roleData, "Name", post["Role"][i]);
			if(role_obj) temp.push(role_obj["Id"]); 
		}
		post["Role"] =  temp.join(",");

		console.log(post);
		$http.post($scope.postUrl, post).success(function(data, status, headers, config) {
			if ($filter("CheckError")(data)){
                configService.getConfig("Admin");
                $modalInstance.close(data);
            }
            
		});

    };
	/***********************数据定义*****************************/
    $scope.roles = [];
	$scope.attrDef = [
            {"Key":"Username", "Title":"登录账号", "InputType":"text", "Required":"false"},
			{"Key":"Password", "Title":"密　　码", "InputType":"password", "Required":"true"},
			{"Key":"ConfirmPassword", "Title":"确认密码", "InputType":"password", "Required":"true"},
            {"Key":"Status", "Title":"状　　态", "InputType":"radio", "Value":[[1,"正常"],[2,"封杀"]], "Required":"false"},
			{"Key":"Role", "Title":"角　　色", "InputType":"select-multiple", "Required":"false","Value":$scope.roles},
            {"Key":"Photo", "Title":"头　　像", "InputType":"upload-img", "Value":{"Width":136,"Height":136,"Force":1,"Quality":0.7}},
            
        
			{"Key":"Name", "Title":"姓　　名", "InputType":"text", "Required":"true"},
            {"Key":"Sex", "Title":"性　　别", "InputType":"radio", "Value":[[1,"男"],[2,"女"]]},
            {"Key":"Birthday", "Title":"出生日期", "InputType":"date", "Required":"false", "Id":"birthday_time", "Format":"Y-m-d", "Showtime":"false", "Min":1960, "Max":2010},
			{"Key":"Email", "Title":"邮　　箱", "InputType":"email", "Required":"false"},
            {"Key":"IdentityId", "Title":"身份证号", "InputType":"text", "Required":"false"},
            {"Key":"Mobile", "Title":"手机号码", "InputType":"text", "Required":"false"},
            {"Key":"Address", "Title":"现 住 址", "InputType":"text", "Required":"false"},
            {"Key":"Note", "Title":"备　　注", "InputType":"textarea", "Required":"false"},

	];	
	

    $scope.checkData = function(){
        var temp = angular.copy($scope.attrDef);
		for (var i = 0 ; i < temp.length; i++){
			if (temp[i].Required == "true" && ( angular.isUndefined( $scope.editData[temp[i].Key] ) || $scope.editData[temp[i].Key] == "")){
				return true;
			}
		}
		return false;	
	};
    /***********************图片更新回调********************************/
	$scope.changeCallback = function(img) {
		$scope.editData["Photo"] = img.resized.dataURL
	};
    
	/***********************初始化*****************************/	
	$scope.title= "个人信息";
	
	$scope.op = curr_data.Op;
	$scope.oldData = angular.copy(curr_data.Data);
	$scope.editData = angular.copy($scope.oldData);
    

	$scope.attrDef[1].Required = "false";
    $scope.attrDef[2].Required = "false";
	$scope.postUrl = appCfg.AdminPrefix +"/public/info";

}])