app.controller("RoleCtrl", ["$scope", "$http", "$filter", "$modal", "appCfg", "EzConfirm", function ($scope, $http, $filter, $modal, appCfg, EzConfirm) {

	$scope.search = {
						Keyword:"",
						Start:"",
						End:"",
						PageSize:20,//单页条数
						Page:1,//默认当前页为第一页
					};
	
    $scope.getList = function(page) {
		$scope.search.Page = page || $scope.search.Page;
		var url = appCfg.AdminPrefix + "/role/list";
		$http.post(url, $scope.search).success(function(data, status, headers, config) {
			if ($filter("CheckError")(data)){
				$scope.listData= data.Data;
			}
		});	
	};
	
    


    var modalInstance;
	
	$scope.add = function(){

        modalInstance = $modal.open({
            templateUrl: "/static/page/modal/base.html?"+version,
            controller: "RoleEditCtrl",
            backdrop: false,
            resolve: {
            	curr_data: function () {
                    return {"OP":"add","Data":{}}
                }
            }
        }), modalInstance.result.then(function (data) {

			$scope.getList(1);

        });
		
	};

	$scope.edit = function(id, op){
        var op = op || 'edit';
        var url = appCfg.AdminPrefix + "/role/edit/" + id;
		$http.get(url).success(function(data, status, headers, config) {
			if ($filter("CheckError")(data)){
                var temp = data.Data;
                temp.Password = "";
                temp.ConfirmPassword = "";
				modalInstance = $modal.open({
					backdrop: false,
                    templateUrl: "/static/page/modal/base.html?"+version,
                    controller: "RoleEditCtrl",
		            resolve: {
		            	curr_data: function () {
		                    return {"Op":op, "Data":temp};
		                }
		            }
		        }), modalInstance.result.then(function (data) {
        			$scope.getList();
        		});
			} 
		});
        
	};



	//角色删除
	$scope.del = function(item) {

		EzConfirm.create({heading: '管理员删除', text: '确定删除此管理员吗？'}).then(function() {
        	var post = angular.copy(item);    	
			var url = appCfg.AdminPrefix + "/role/del";
			$http.post(url, post).success(function(data, status, headers, config) {
				if( $filter("CheckError")(data) ){	
					$scope.getList();
				}
			});		
        });
	};


	$scope.getList($scope.search.Page);
}])