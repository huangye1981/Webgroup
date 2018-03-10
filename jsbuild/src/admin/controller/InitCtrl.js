//初始化控制器

app.controller("InitCtrl", ["$scope", "$rootScope", "$location", "$http", "LoginService", "appCfg", "EzConfirm", function ($scope, $rootScope, $location, $http, LoginService, appCfg, EzConfirm ) {
    var $window;
    $window = $(window);

    $scope.admin = {
		name:appname,
        layout: !1,
        menu: !1,
        fixedHeader: !0,
        fixedSidebar: !0,
        themeID: "32",
        navbarHeaderColor: "bg-primary",
        navbarlogo: "bg-primary",
        asideColor: "bg-white",
		show: !1,
    };
	
    $scope.color = {
        primary: "#248AAF",
        success: "#3CBC8D",
        info: "#29B7D3",
        purple: "#7266ba",
        warning: "#FAC552",
        danger: "#E9422E"
    };

	$scope.lang = "cn";
	//尝试登陆
	LoginService.reLogin();
	
	$scope.loginData = LoginService.data;

	//权限检测
	$scope.checkPermission = LoginService.checkPermission;
	

	//系统节点检测
	$scope.checkSystem = LoginService.checkSystem;

    
	
}])



