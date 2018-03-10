
app.service('LoginService', ["$rootScope", "$window", "$http", "$location", "md5", "appCfg", function($rootScope, $window, $http, $location, md5, appCfg) { 

	var service = {
		
		
		//登录用户数据结构
    	data: {Code:0, Admin:{}, Lock:0, Nav:[], Role:""},
		
		//用户登录
		login : function (username, password, remember){
            
            var post_url = appCfg.AdminPrefix + '/login/login';
            var post_data = {"Username":username, "Password":password};
            return $http.post(post_url, post_data).success(function(data, status, headers, config) {
                
				if(data.Code==1){
					service.data.Code = data.Code;
					service.data.Admin = data.Data.Admin;
					data.Data.Nav = data.Data.Nav || [];
					//初始化节点数据
					service.data.Nav = [];
					service.data.Nav = list_2_tree(service.data.Nav, data.Data.Nav, 1);
					service.data.Nav = service.data.Nav.Childs;

					service.data.Role = data.Data.Role;

					if (service.data.Role != "root"){
						for (var i in service.data.Role){
							service.data.Role[i]["Permission"] = angular.fromJson(service.data.Role[i]["Permission"]||{});
							service.data.Role[i]["System"] = service.data.Role[i]["System"].split(",");
						}
					}
                    
					if (remember){
						$window.localStorage["Username"] = username;
						$window.localStorage["Password"] = password;
					}
                   
				}
			});
		},
	

		//重新登录
		reLogin : function (){
			console.log("重新登录");
			//服务器检测登录状态
			return $http.get(appCfg.AdminPrefix + '/login/islogin/').success(function(data, status, headers, config) {
				
				if(data.Code==1){
					service.data.Code = data.Code;
					service.data.Admin = data.Data.Admin;
					data.Data.Nav = data.Data.Nav || [];
					//初始化节点数据
					service.data.Nav = [];
					service.data.Nav = list_2_tree(service.data.Nav, data.Data.Nav, 1);
					service.data.Nav = service.data.Nav.Childs;

					service.data.Role = data.Data.Role;

					if (service.data.Role != "root"){
						for (var i in service.data.Role){
							service.data.Role[i]["Permission"] = angular.fromJson(service.data.Role[i]["Permission"]||{});
							service.data.Role[i]["System"] = service.data.Role[i]["System"].split(",");
						}
					}

				}else{

					var username = $window.localStorage["Username"] || "";
					var password = $window.localStorage["Password"] || "";
					if (username == "" || password == "") {						
						$location.path("/login");
					}
                    service.login(username, password, true);
					
				}
				
				
			});


			
		},

		//退出登录
		logout : function (){
			$window.localStorage["Username"] = "";
			$window.localStorage["Password"] = "";

			$http.get(appCfg.AdminPrefix + '/login/logout/').success(function(data, status, headers, config) {
				
				if(data.Code==1){
					service.data.Code = 0;
					service.data.Admin = {};
					service.data.Nav = [];
					service.data.Role = "";
					$location.path("/login")

				}
				
			});
		},
		
		//登录检测
		isLogin : function (){
			if (service.data.Admin.Id == "") return false;
			return true;
		},
		//解锁
		unlock : function (password){
			if(md5.createHash(password) == service.data.Admin.Password ){
				service.data.Lock = 0;
				return true;
			}
			return false;
		},
		//项目权限检测
		checkPermission : function (mode, action){
			if (service.data.Role == 'root'){
				return true
			}
			for (var i in service.data.Role){
				if( angular.isUndefined(service.data.Role[i]["Permission"][mode])){
					continue;
				}else if( angular.isUndefined(service.data.Role[i]["Permission"][mode][action])){
					continue;
				}else {
					if( service.data.Role[i]["Permission"][mode][action] ) return true;
					continue;
				}
			}
			return false;
		},
		//系统权限检测
		checkSystem:  function(node){

			if (service.data.Role == 'root'){
				return true
			}
			for (var i in service.data.Role){
				if ( service.data.Role[i]["System"].indexOf(node) > -1) return true;
			}
			
			return false;
		}
		

	}

	return service;

}]);