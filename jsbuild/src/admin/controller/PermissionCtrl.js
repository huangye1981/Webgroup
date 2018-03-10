app.controller("PermissionCtrl", ["$scope", "$log", "$window", "$modal", "$routeParams", "$http", "$filter",  "appCfg", "LoginService", "EzConfirm", function ($scope, $log, $window, $modal, $routeParams, $http, $filter, appCfg, LoginService, EzConfirm) {

	$scope.roleId  = parseInt($routeParams.role_id);
	
	$http.get( appCfg.AdminPrefix + '/role/view/'+$scope.roleId).success(function(data, status, headers, config) {
		
		$scope.code = data.Code;
		if( $filter("CheckError")(data) ){	
			$scope.roleData = data.Data.Role; //记录数
			$scope.roleData["Permission"] = $scope.roleData["Permission"] || "[]";
			$scope.roleData["Permission"] =  angular.fromJson($scope.roleData["Permission"]) ;
			

			$scope.modeData = data.Data.Mode;
			$scope.list = {};
			$scope.list = list_2_tree($scope.list, $scope.modeData, 1);
			$scope.list = $scope.list.Childs;
			
			//权限初始化
			for(var i in $scope.list ){
				for(var k in $scope.list[i]["Childs"] ){

					if(angular.isUndefined( $scope.roleData["Permission"][$scope.list[i]["Key"]]) ){
						$scope.roleData["Permission"][$scope.list[i]["Key"]] = {};
						$scope.roleData["Permission"][$scope.list[i]["Key"]][$scope.list[i]["Childs"][k]["Key"]] = false;
					}else if( angular.isUndefined($scope.roleData["Permission"][$scope.list[i]["Key"]][$scope.list[i]["Childs"][k]["Key"]]) ){
						$scope.roleData["Permission"][$scope.list[i]["Key"]][$scope.list[i]["Childs"][k]["Key"]] = false;
					}
				}
			}

		}

			
	});
	

	$scope.save = function(){
		var post = {Id:$scope.roleData["Id"], Permission:angular.toJson( angular.copy($scope.roleData["Permission"]) )};

		$http.post( appCfg.AdminPrefix + '/role/permission/', post).success(function(data, status, headers, config) {
			if( $filter("CheckError")(data) ){	
				if($scope.loginData.Role!='root' && array_obj_find($scope.loginData.Role,"Id",post.Id) !==false ){
					LoginService.reLogin();
				}
				EzConfirm.create({text: '权限数据保存成功！',hiddenFoot:true});

			}
			
		

		});

	};

	$scope.del  = function(id){
		
		EzConfirm.create({text: '确定删除此权限吗？'}).then(function() {
        	$http.get(appCfg.AdminPrefix + '/role/del/'+id).success(function(data, status, headers, config) {
				if( $filter("CheckError")(data) ){	
					return $window.history.back();
				}
			});
        });

	};

	$scope.select = function( $event ){


		for(var i in $scope.roleData["Permission"][$event.target.id] ){
			
			$scope.roleData["Permission"][$event.target.id][i] = $event.target.checked
			
		}
		
	}

}])

