
var app = angular.module("App", [
										"ngRoute", 
										"ng.ueditor",
										"ngAnimate", 
										"ngSanitize", 
										"ngTable", 
										"ngCookies", 
										"ui.bootstrap",
										"ui.tree",
										"ui.select",
										"imageupload",
										"angular-md5",
										"xeditable",
										"ez.confirm",
										"ng-currency"
										
])

.constant("appCfg", {
	"AdminPrefix":"/admin",
	"AppPrefix":"",
	"Sex":[{"Id":1,"Name":"男"},{"Id":2,"Name":"女"},{"Id":3,"Name":"保密"}],
	"Status":[{"Id":1,"Name":"正常"},{"Id":2,"Name":"封杀"}],
})

.config(["$routeProvider", "$httpProvider", function ($routeProvider, $httpProvider) {
    
    //重新定义post方法 angularjs中$http模块POST请求request payload转form data
    $httpProvider.defaults.transformRequest = function(obj){
        var str = [];
        for(var p in obj){
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
        return str.join("&");
    }

    $httpProvider.defaults.headers.post = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }

   
    var routes, setRoutes;
    routes = [
					"404",
					"500", 
					"login", 
					"lock", 
					"init", 
					"admin/settings", 
					"admin/admin", 
					"admin/node", 
					"admin/ipban", 
					"admin/role", 					
					"admin/logs",
					"admin/mode",
					];

		routes.forEach(function (route) {
        	var config, url, login;
	        url = "/" + route;
			login = true;
			if (route == "login" || route == "404" || route == "505" || route == "lock"){
				login = false;
			}
			config = {templateUrl: "/static/page/" + route + ".html?"+version, login : login};
			$routeProvider.when(url, config);
    	});
	
		$routeProvider.when("/", {
			redirectTo: "/start"
		})
		

		.when('/admin/permission/:role_id', {
			templateUrl: '/static/page/admin/permission.html',
			controller: "PermissionCtrl"
		})
		.when('/admin/pnode/:role_id', {
			templateUrl: '/static/page/admin/pnode.html',
			controller: "PnodeCtrl"
		})

		.otherwise({redirectTo: "/404"})
		
}]);


