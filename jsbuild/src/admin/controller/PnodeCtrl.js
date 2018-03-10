


app.controller("PnodeCtrl",  ["$scope", "$window", "$http", "$filter", "$modal", "$routeParams",  "appCfg", "LoginService", "EzConfirm", function ($scope, $window, $http, $filter, $modal, $routeParams, appCfg, LoginService, EzConfirm) {


	$scope.select = {};
	
	$scope.system = {};

	$http.get( appCfg.AdminPrefix + '/role/view/'+parseInt($routeParams.role_id)).success(function(data, status, headers, config) {

		
		if( $filter("CheckError")(data) ){	
			$scope.roleData = data.Data.Role; //记录数
			var temp = $scope.roleData.Node.split(',');
			for (var i in temp){
				$scope.select[temp[i]] = true;
			}
			
			temp = $scope.roleData.System.split(',');
			for (var i in temp){
				$scope.system[temp[i]] = true;
			}
		}	
		
	});
	



	$scope.getNode = function () {
		
		$scope.list = [];
		var url = appCfg.AdminPrefix + "/node/list";
		$http.get(url).success(function(data, status, headers, config) {
			
			if( $filter("CheckError")(data) ){	
				$scope.itemList = data.Data;
				
				$scope.list = list_2_tree($scope.list, $scope.itemList, 1);
				$scope.list = $scope.list.Childs;
			}
			
		});	
	};



	$scope.save = function(){

		var node = [];
		for (var i in $scope.select){
			if( $scope.select[i] ){
				node.push(i);
			}
		}

		var system = [];
		for (var i in $scope.system){
			if( $scope.system[i] ){
				system.push(i);
			}
		}

		var post = {Id:$scope.roleData["Id"], Node:node.join(","),  System:system.join(",")};

		$http.post( appCfg.AdminPrefix + '/role/node/', post).success(function(data, status, headers, config) {
			if( $filter("CheckError")(data) ){	
				LoginService.reLogin();
				EzConfirm.create({text: '节点数据保存成功！',hiddenFoot:true});
			}
			
		});
		
		
	};



	$scope.getNode();

	

}])