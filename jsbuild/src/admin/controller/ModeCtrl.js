app.controller("ModeCtrl", ["$scope", "$http", "$filter", "$modal", "appCfg", "configService", "EzConfirm", function ($scope, $http, $filter, $modal, appCfg, configService, EzConfirm) {
	
	$scope.search = {
						Keyword:""
					};

    $scope.getList = function() {
		var url = appCfg.AdminPrefix + "/mode/list";
		$http.post(url, $scope.search).success(function(data, status, headers, config) {
			 if ($filter("CheckError")(data)){
				$scope.list = {};
				$scope.list = list_2_tree($scope.list, data.Data, 1);
				$scope.list = $scope.list.Childs;
			}
		});	
	};
    
	var modalInstance;

	$scope.add = function(parent_id, func){

		var parent_id = parent_id || -1;
		var func = func || 0;

        modalInstance = $modal.open({
			backdrop: false,
            templateUrl: "/static/page/modal/base.html",
            controller: "ModeEditCtrl",
            backdrop: false,
            resolve: {
            	curr_data: function () {
                    return {"Op":"add", Data:{"Func":func, "Type":1, "ParentId":parent_id, "Sort":100,"Logs":1}}
                }
            }
        }), modalInstance.result.then(function (data) {
			$scope.getList(1);
       
        });
	};

	$scope.edit = function(id, op){

        var op = op || 'edit';
        var url = appCfg.AdminPrefix + "/mode/edit/" + id;
		$http.get(url).success(function(data, status, headers, config) {
			if ($filter("CheckError")(data)){
               
				modalInstance = $modal.open({
					backdrop: false,
                    templateUrl: "/static/page/modal/base.html",
                    controller: "ModeEditCtrl",
		            resolve: {
		            	curr_data: function () {
		                    return {"Op":op, "Data":data.Data};
		                }
		            }
		        }), modalInstance.result.then(function (data) {
        			$scope.getList();
        		});
			} 
		});
        
        
	};

	$scope.del = function(item){

		EzConfirm.create({heading: '模块删除', text: '确定删除此模块吗？'}).then(function() {
            var url = appCfg.AdminPrefix + "/mode/del";
        	$http.post(url, item).success(function(data, status, headers, config) {
				if($filter("CheckError")(data)){
                    $scope.getList();
                    configService.getConfig("Mode");
				}
			});
        });

	};


	//默认执行
	$scope.getList();


}])