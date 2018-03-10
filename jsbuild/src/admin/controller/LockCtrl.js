//头部控制器

app.controller("LockCtrl", ["$scope", "$window", "$location", "LoginService", function($scope, $window, $location, LoginService) {
	
	LoginService.data.Lock = 1;
	$scope.unLock = function(){
		if( LoginService.unlock($scope.lockpassword) ){
			$window.history.back();
		}
		
	};


}])
