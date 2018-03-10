app.controller("AdminCtrl", ["$scope", "$modal", "$http", "$filter", "appCfg", "EzConfirm", "configService",  function ($scope, $modal, $http, $filter, appCfg, EzConfirm, configService) {

	$scope.search = {
						Keyword:"",
						Start:"",
						End:"",
						PageSize:20,//单页条数
						Page:1,//默认当前页为第一页
					};
	
    $scope.getList = function(page) {
		$scope.search.Page = page || $scope.search.Page;
		var url = appCfg.AdminPrefix + "/admin/list";
		$http.post(url, $scope.search).success(function(data, status, headers, config) {
			if ($filter("CheckError")(data)){
				$scope.listData= data.Data;
			}
		});	
	};
	
    

    var modalInstance;
	//管理员添加
	$scope.add = function(){

        modalInstance = $modal.open({
            templateUrl: "/static/page/modal/admin_edit.html?"+version,
            controller: "AdminEditCtrl",
            backdrop: false,
            resolve: {
            	curr_data: function () {
                    return {"OP":"add","Data":{"Status":1, "Sex": 1, "Photo":""}}
                }
            }
        }), modalInstance.result.then(function (data) {

			$scope.getList(1);

        });
		
	};

	$scope.edit = function(id, op){
        var op = op || 'edit';
        var url = appCfg.AdminPrefix + "/admin/edit/" + id;
		$http.get(url).success(function(data, status, headers, config) {
			if ($filter("CheckError")(data)){
                var temp = data.Data;
                temp.Password = "";
                temp.ConfirmPassword = "";
				temp.Share = (temp.Share==0) ? 1 : temp.Share
                if (temp.Birthday>0){
                    temp.Birthday =  new Date(temp.Birthday * 1000).Format("yyyy-MM-dd");
                }
                
				modalInstance = $modal.open({
					backdrop: false,
                    templateUrl: "/static/page/modal/admin_edit.html?"+version,
                    controller: "AdminEditCtrl",
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



	//管理员删除
	$scope.del = function(item) {

		EzConfirm.create({heading: '管理员删除', text: '确定删除此管理员吗？'}).then(function() {
        	var post = angular.copy(item);    	
			var url = appCfg.AdminPrefix + "/admin/del";
			$http.post(url, post).success(function(data, status, headers, config) {
				if( $filter("CheckError")(data) ){	
                    configService.getConfig("Admin");
					$scope.getList();
				}
			});		
        });
	};


	$scope.getList($scope.search.Page);
}])

