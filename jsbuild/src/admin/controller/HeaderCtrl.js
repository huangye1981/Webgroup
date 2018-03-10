//头部控制器
app.controller("HeaderCtrl", ["$scope", "$modal", "$window", "$location", "LoginService", "configService", function ($scope, $modal, $window, $location, LoginService, configService) {
	

	var modalInstance;

	//个人信息编辑
	$scope.infoEdit = function(){
		
		var temp = $scope.loginData.Admin;
        temp.Password = "";
        temp.ConfirmPassword = "";
        if (temp.Birthday>0){
             temp.Birthday =  new Date(temp.Birthday * 1000).Format("yyyy-MM-dd");
        }
		        
        modalInstance = $modal.open({
			backdrop: false,
             templateUrl: "/static/page/modal/info_edit.html?"+version,
                    controller: "InfoEditCtrl",
		            resolve: {
		            	curr_data: function () {
		                    return {"Op":"edit", "Data":temp};
		                }
		            }
        }), modalInstance.result.then(function (data) {
      			LoginService.data.Admin = data.Data;
      	});

	};
	
	//退出登录
	
	$scope.logout = function(){

		LoginService.logout();

	};


}]);

