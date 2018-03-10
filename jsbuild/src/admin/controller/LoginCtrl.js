//头部控制器

app.controller("LoginCtrl", ["$scope", "$location", "$filter", "LoginService", function($scope, $location, $filter, LoginService) {

	$scope.data = 	{
						Msg:"输入账号和密码进行登录",
						Username:"",
						Password:"",
						Remember:false
					};

	$scope.login = function(){

		LoginService.login($scope.data.Username, $scope.data.Password, $scope.data.Remember).success(function(data, status, headers, config) {
            if ($filter("CheckError")(data)){
                $location.path("/");
            }else{
				$scope.data.Msg = data.Msg;
			}
		});

	};


}])
