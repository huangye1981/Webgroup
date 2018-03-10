app.controller("IpbanCtrl", ["$scope", "$http", "$modal", "$filter", "appCfg", "EzConfirm", function ($scope, $http, $modal, $filter, appCfg, EzConfirm) {

	
    $scope.search = {
						Keyword:"",
						Start:"",
						PageSize:20,//单页条数
						Page:1,//默认当前页为第一页
					};



	//**************************************************************
	$scope.getList = function(page) {
		$scope.search.Page = page || $scope.search.Page;
		var url = appCfg.AdminPrefix + "/ipban/list";
		$http.post(url, $scope.search).success(function(data, status, headers, config) {
            if ($filter("CheckError")(data)){
				$scope.listData= data.Data;
			}
		});	
	};
    
    var modalInstance;
	$scope.add = function(){

        modalInstance = $modal.open({
			backdrop: false,
            templateUrl: "/static/page/modal/base.html?"+version,
            controller: "IpbanEditCtrl",
            backdrop: false,
            resolve: {
            	curr_data: function () {
                    return {"Op":"add", "Data":{"Start": new Date().Format("yyyy-MM-dd H:i"), "End": new Date().Format("yyyy-MM-dd hh:mm"), "Status":1}};
                }
            }
        }), modalInstance.result.then(function (data) {
			$scope.getList(1);
        });
	};

	$scope.edit = function(id, op){

        var op = op || "edit";
		var url = appCfg.AdminPrefix + "/ipban/edit/" + id;
		$http.get(url).success(function(data, status, headers, config) {
            if ($filter("CheckError")(data)){
				var temp = data.Data;
				
				temp["Start"] =  new Date(temp["Start"] * 1000).Format("yyyy-MM-dd hh:mm");
				temp["End"] =  new Date(temp["End"] * 1000).Format("yyyy-MM-dd hh:mm");
				
				modalInstance = $modal.open({
					backdrop: false,
                    templateUrl: "/static/page/modal/base.html?"+version,
                    controller: "IpbanEditCtrl",
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

     
	$scope.del = function(item) {

		EzConfirm.create({heading: 'IP删除', text: '确定删除此IP吗？'}).then(function() {
	        var post = angular.copy(item);    	
			
			var url = appCfg.AdminPrefix + "/ipban/del";
			$http.post(url, post).success(function(data, status, headers, config) {
				if ($filter("CheckError")(data)){
					$scope.getList();
				} 
			});		
		});
	};
    

	//默认执行
	$scope.getList();


}])