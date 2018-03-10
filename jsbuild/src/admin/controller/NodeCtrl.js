app.controller("NodeCtrl", ["$scope", "$http", "$filter", "$modal", "appCfg", "LoginService", "EzConfirm", function ($scope, $http, $filter, $modal, appCfg, LoginService, EzConfirm) {


	$scope.getNode = function () {
		
		$scope.list = [];
		var url = appCfg.AdminPrefix + "/node/list";
		$http.get(url).success(function(data, status, headers, config) {
			//错误检测
			if( $filter("CheckError")(data)){	
				$scope.list = list_2_tree($scope.list, data.Data, 1);
				$scope.list = $scope.list.Childs;
			}
		});	
	};


    var modalInstance;
    
	$scope.add = function(parent_id){

        modalInstance = $modal.open({
            templateUrl: "/static/page/modal/base.html?"+version,
            controller: "NodeEditCtrl",
            backdrop: false,
            resolve: {
            	curr_data: function () {
                    return {"Op":"add", Data:{"ParentId":parent_id, "Sort":100} }
                }
            }
        }), modalInstance.result.then(function (data) {
			if( $filter("CheckError")(data) ){	
				$scope.getNode();
			}
        });
	};

	$scope.edit = function(id, op){
		        
        var op = op || 'edit';
        var url = appCfg.AdminPrefix + "/node/edit/" + id;
		$http.get(url).success(function(data, status, headers, config) {
			if ($filter("CheckError")(data)){
				modalInstance = $modal.open({
				    templateUrl: "/static/page/modal/base.html?"+version,
                    controller: "NodeEditCtrl",
		            resolve: {
		            	curr_data: function () {
		                    return {"Op":op, "Data":data.Data};
		                }
		            }
		        }), modalInstance.result.then(function (data) {
        			$scope.getNode();
        		});
			} 
		});
        
	};



	$scope.del = function(item){
		
		EzConfirm.create({text: '确定删除此节点吗？'}).then(function() {
        	$http.post(appCfg.AdminPrefix + '/node/del/', item).success(function(data, status, headers, config) {
				if( $filter("CheckError")(data) ){	
					$scope.getNode();
                    LoginService.reLogin();
				}
			});
        });

	};

	$scope.getNode();

	

}])