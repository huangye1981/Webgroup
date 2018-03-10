/*! admin - v1.0.0 - 2016-12-4 */
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



;
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


;

app.controller("AdminEditCtrl", ["$scope", "$http", "$modalInstance", "$filter", "configService", "curr_data", "appCfg",  function ($scope, $http, $modalInstance, $filter, configService, curr_data, appCfg) {
    

    $scope.cancel = function () {
    	$modalInstance.dismiss("cancel");
    };   
	
    $scope.reset = function() {
    	$scope.editData = angular.copy($scope.oldData);
    };
    
    $scope.change = function(attr) {
    	if (attr.length==0) {
    		for (var attr in $scope.editData) {
    			if (!$scope.oldData.hasOwnProperty(attr)) {
    				return true;
    			}
    			if ($scope.oldData[attr] != $scope.editData[attr]) {
            		return true;
            	}
    		}
        	return false;    		
    	} else {
			if (!$scope.oldData.hasOwnProperty(attr)) {
				return true;
			}
    		if ($scope.oldData[attr] != $scope.editData[attr]) {
        		return true;
        	}
        	return false;
    	}
    	return false;
    };
    
    $scope.save = function() {

		var post = angular.copy($scope.editData);
		
		temp = [];
		for (var i in post["Role"]){
			var role_obj = array_obj_find($scope.roleData, "Name", post["Role"][i]);
			if(role_obj) temp.push(role_obj["Id"]); 
		}
		post["Role"] =  temp.join(",");

		console.log(post);
		$http.post($scope.postUrl, post).success(function(data, status, headers, config) {
			if ($filter("CheckError")(data)){
                configService.getConfig("Admin");
                $modalInstance.close(data);
            }
            
		});

    };
	/***********************数据定义*****************************/
    $scope.roles = [];
	$scope.attrDef = [
            {"Key":"Username", "Title":"登录账号", "InputType":"text", "Required":"true"},
			{"Key":"Password", "Title":"密　　码", "InputType":"password", "Required":"true"},
			{"Key":"ConfirmPassword", "Title":"确认密码", "InputType":"password", "Required":"true"},
            {"Key":"Status", "Title":"状　　态", "InputType":"radio", "Value":[[1,"正常"],[2,"禁用"]], "Required":"true"},
			{"Key":"Role", "Title":"角　　色", "InputType":"select-multiple", "Required":"false","Value":$scope.roles},
            {"Key":"Photo", "Title":"头　　像", "InputType":"upload-img", "Value":{"Width":136,"Height":136,"Force":1,"Quality":0.7}},
            
        
			{"Key":"Name", "Title":"姓　　名", "InputType":"text", "Required":"true"},
            {"Key":"Sex", "Title":"性　　别", "InputType":"radio", "Value":[[1,"男"],[2,"女"]]},
            {"Key":"Birthday", "Title":"出生日期", "InputType":"date", "Required":"false", "Id":"birthday_time", "Format":"Y-m-d", "Showtime":"false", "Min":1960, "Max":2010},
			{"Key":"Email", "Title":"邮　　箱", "InputType":"email", "Required":"false"},
            {"Key":"IdentityId", "Title":"身份证号", "InputType":"text", "Required":"false"},
            {"Key":"Mobile", "Title":"手机号码", "InputType":"text", "Required":"false"},
            {"Key":"Address", "Title":"现 住 址", "InputType":"text", "Required":"false"},
            {"Key":"Note", "Title":"备　　注", "InputType":"textarea", "Required":"false"},


	];	
	

    $scope.checkData = function(){
        var temp = angular.copy($scope.attrDef);
		for (var i = 0 ; i < temp.length; i++){
			if (temp[i].Required == "true" && ( angular.isUndefined( $scope.editData[temp[i].Key] ) || $scope.editData[temp[i].Key] == "")){
				return true;
			}
		}
		return false;	
	};
    /***********************图片更新回调********************************/
	$scope.changeCallback = function(img) {
		$scope.editData["Photo"] = img.resized.dataURL
	};
    
	/***********************初始化*****************************/	
	$scope.title= "添加新管理员";
	$scope.postUrl = appCfg.AdminPrefix +"/admin/add";

	$scope.op = curr_data.Op;
	$scope.oldData = angular.copy(curr_data.Data);
	$scope.editData = angular.copy($scope.oldData);
    
    //初始化角色数据
    $scope.roleData = [];
	var temp = $scope.editData["Role"] ? $scope.editData["Role"].split(",") : [];
	$scope.editData["Role"] = [];
    	
    //获取角色列表
    $scope.roleData = configService.data.Role;
	
    for( var i in $scope.roleData){
        $scope.roles.push($scope.roleData[i]["Name"]); 
    }

    $scope.editData["Role"] = [];
    for( var i in temp){
        var role_obj = array_obj_find($scope.roleData, "Id", temp[i]);
        if(role_obj) $scope.editData["Role"].push(role_obj["Name"]); 
    }

    

	if (curr_data.Op=='edit'){
		$scope.title= "编辑管理员信息";
        $scope.attrDef[1].Required = "false";
        $scope.attrDef[2].Required = "false";
		$scope.postUrl = appCfg.AdminPrefix +"/admin/edit";
	}

}])
;
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


;

app.controller("InfoEditCtrl", ["$scope", "$http", "$modalInstance", "$filter", "configService", "curr_data", "appCfg",  function ($scope, $http, $modalInstance, $filter, configService, curr_data, appCfg) {
    

    $scope.cancel = function () {
    	$modalInstance.dismiss("cancel");
    };   
	
    $scope.reset = function() {
    	$scope.editData = angular.copy($scope.oldData);
    };
    
    $scope.change = function(attr) {
    	if (attr.length==0) {
    		for (var attr in $scope.editData) {
    			if (!$scope.oldData.hasOwnProperty(attr)) {
    				return true;
    			}
    			if ($scope.oldData[attr] != $scope.editData[attr]) {
            		return true;
            	}
    		}
        	return false;    		
    	} else {
			if (!$scope.oldData.hasOwnProperty(attr)) {
				return true;
			}
    		if ($scope.oldData[attr] != $scope.editData[attr]) {
        		return true;
        	}
        	return false;
    	}
    	return false;
    };
    
    $scope.save = function() {

		var post = angular.copy($scope.editData);
		
		temp = [];
		for (var i in post["Role"]){
			var role_obj = array_obj_find($scope.roleData, "Name", post["Role"][i]);
			if(role_obj) temp.push(role_obj["Id"]); 
		}
		post["Role"] =  temp.join(",");

		console.log(post);
		$http.post($scope.postUrl, post).success(function(data, status, headers, config) {
			if ($filter("CheckError")(data)){
                configService.getConfig("Admin");
                $modalInstance.close(data);
            }
            
		});

    };
	/***********************数据定义*****************************/
    $scope.roles = [];
	$scope.attrDef = [
            {"Key":"Username", "Title":"登录账号", "InputType":"text", "Required":"false"},
			{"Key":"Password", "Title":"密　　码", "InputType":"password", "Required":"true"},
			{"Key":"ConfirmPassword", "Title":"确认密码", "InputType":"password", "Required":"true"},
            {"Key":"Status", "Title":"状　　态", "InputType":"radio", "Value":[[1,"正常"],[2,"封杀"]], "Required":"false"},
			{"Key":"Role", "Title":"角　　色", "InputType":"select-multiple", "Required":"false","Value":$scope.roles},
            {"Key":"Photo", "Title":"头　　像", "InputType":"upload-img", "Value":{"Width":136,"Height":136,"Force":1,"Quality":0.7}},
            
        
			{"Key":"Name", "Title":"姓　　名", "InputType":"text", "Required":"true"},
            {"Key":"Sex", "Title":"性　　别", "InputType":"radio", "Value":[[1,"男"],[2,"女"]]},
            {"Key":"Birthday", "Title":"出生日期", "InputType":"date", "Required":"false", "Id":"birthday_time", "Format":"Y-m-d", "Showtime":"false", "Min":1960, "Max":2010},
			{"Key":"Email", "Title":"邮　　箱", "InputType":"email", "Required":"false"},
            {"Key":"IdentityId", "Title":"身份证号", "InputType":"text", "Required":"false"},
            {"Key":"Mobile", "Title":"手机号码", "InputType":"text", "Required":"false"},
            {"Key":"Address", "Title":"现 住 址", "InputType":"text", "Required":"false"},
            {"Key":"Note", "Title":"备　　注", "InputType":"textarea", "Required":"false"},

	];	
	

    $scope.checkData = function(){
        var temp = angular.copy($scope.attrDef);
		for (var i = 0 ; i < temp.length; i++){
			if (temp[i].Required == "true" && ( angular.isUndefined( $scope.editData[temp[i].Key] ) || $scope.editData[temp[i].Key] == "")){
				return true;
			}
		}
		return false;	
	};
    /***********************图片更新回调********************************/
	$scope.changeCallback = function(img) {
		$scope.editData["Photo"] = img.resized.dataURL
	};
    
	/***********************初始化*****************************/	
	$scope.title= "个人信息";
	
	$scope.op = curr_data.Op;
	$scope.oldData = angular.copy(curr_data.Data);
	$scope.editData = angular.copy($scope.oldData);
    

	$scope.attrDef[1].Required = "false";
    $scope.attrDef[2].Required = "false";
	$scope.postUrl = appCfg.AdminPrefix +"/public/info";

}])
;
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




;
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
;

app.controller("IpbanEditCtrl", ["$scope", "$http", "$filter", "$modalInstance",  "curr_data", "appCfg", function ($scope, $http, $filter, $modalInstance, curr_data, appCfg) {


    $scope.cancel = function () {
    	$modalInstance.dismiss("cancel");
    };   
	
    $scope.reset = function() {
    	$scope.editData = angular.copy($scope.oldData);
    };
    
    $scope.change = function(attr) {
    	if (attr.length==0) {
    		for (var attr in $scope.editData) {
    			if (!$scope.oldData.hasOwnProperty(attr)) {
    				return true;
    			}
    			if ($scope.oldData[attr] != $scope.editData[attr]) {
            		return true;
            	}
    		}
        	return false;    		
    	} else {
			if (!$scope.oldData.hasOwnProperty(attr)) {
				return true;
			}
    		if ($scope.oldData[attr] != $scope.editData[attr]) {
        		return true;
        	}
        	return false;
    	}
    	return false;
    };
    
    $scope.save = function() {
		$http.post($scope.postUrl, $scope.editData).success(function(data, status, headers, config) {
			if ($filter("CheckError")(data)){
				$modalInstance.close(data);
			}
		});

    };
	/***********************数据定义*****************************/
	$scope.attrDef = [
		{"Key":"Ip", "Title":"屏蔽IP", "InputType":"text", "Required":"true"},
		{"Key":"Start", "Title":"开始时间", "InputType":"date", "Required":"true", "Id":"ipban_datetime_start","Format":"Y-m-d H:i"},
		{"Key":"End", "Title":"结束时间", "InputType":"date", "Required":"true", "Id":"ipban_datetime_end","Format":"Y-m-d H:i"},
		{"Key":"Description", "Title":"备　注", "InputType":"textarea"},
	];	
	
	/***********************初始化*****************************/	
	$scope.title= "添加屏蔽IP";
	$scope.postUrl = appCfg.AdminPrefix +"/ipban/add";

	$scope.op = curr_data.Op;
	$scope.oldData = angular.copy(curr_data.Data);
	$scope.editData = angular.copy($scope.oldData);


	if (curr_data.Op=='edit'){
		$scope.title= "编辑屏蔽IP";
		$scope.postUrl = appCfg.AdminPrefix +"/ipban/edit";
	}

}])

;
//头部控制器

app.controller("LockCtrl", ["$scope", "$window", "$location", "LoginService", function($scope, $window, $location, LoginService) {
	
	LoginService.data.Lock = 1;
	$scope.unLock = function(){
		if( LoginService.unlock($scope.lockpassword) ){
			$window.history.back();
		}
		
	};


}])

;
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

;
app.controller("LogsCtrl", ["$scope", "$http", "$filter", "appCfg",  "configService", "EzConfirm", function ($scope, $http, $filter, appCfg, configService, EzConfirm) {

    $scope.config = configService.data;
    
	 $scope.search = {
						Keyword:"",
						Start:"",
						PageSize:20,//单页条数
						Page:1,//默认当前页为第一页
					};



	//**************************************************************
	$scope.getList = function(page) {
		$scope.search.Page = page || $scope.search.Page;
		var url = appCfg.AdminPrefix + "/logs/list";
		$http.post(url, $scope.search).success(function(data, status, headers, config) {
			if ($filter("CheckError")(data)){
				$scope.listData= data.Data;
			}
		});	
	};
    

	$scope.clear = function(){
		EzConfirm.create({heading: '日志清除', text: '确定清除全部日志吗？'}).then(function() {
        	$http.get(appCfg.AdminPrefix + '/logs/clear').success(function(data, status, headers, config) {
				$scope.getList(1);
			});
        });
	};

	$scope.getList($scope.currentPage);
}])
;
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
;

app.controller("ModeEditCtrl", ["$scope", "$http", "$filter", "$modalInstance", "curr_data", "appCfg", "configService","LoginService", function ($scope, $http, $filter, $modalInstance, curr_data, appCfg, configService, LoginService) {

    
    $scope.cancel = function () {
    	$modalInstance.dismiss("cancel");
    };   
	
    $scope.reset = function() {
    	$scope.editData = angular.copy($scope.oldData);
    };
    
    $scope.change = function(attr) {
    	if (attr.length==0) {
    		for (var attr in $scope.editData) {
    			if (!$scope.oldData.hasOwnProperty(attr)) {
    				return true;
    			}
    			if ($scope.oldData[attr] != $scope.editData[attr]) {
            		return true;
            	}
    		}
        	return false;    		
    	} else {
			if (!$scope.oldData.hasOwnProperty(attr)) {
				return true;
			}
    		if ($scope.oldData[attr] != $scope.editData[attr]) {
        		return true;
        	}
        	return false;
    	}
    	return false;
    };
    
    $scope.save = function() {
 
		$http.post($scope.postUrl, $scope.editData).success(function(data, status, headers, config) {
			if($filter("CheckError")(data)){
				configService.getConfig("Mode");
                $modalInstance.close(data);
			} 
		});

    };

	/***********************数据定义*****************************/
	$scope.attrDef = [
			{"Key":"Type", "Title":"模块类型", "InputType":"radio", "Value":[[1,"项目模块"],[2,"系统模块"]]},	
			{"Key":"Name", "Title":"模块名称", "InputType":"text", "Required":"true"},
			{"Key":"Key", "Title":"模块别名", "InputType":"text", "Required":"true"},
			{"Key":"Sort", "Title":"模块排序", "InputType":"text-i", "Required":"true"},
			{"Key":"Description", "Title":"模块备注", "InputType":"textarea"},
	];	
	
	/***********************初始化*****************************/
	
	$scope.title= "添加模块";
	$scope.postUrl = appCfg.AdminPrefix +"/mode/add";

	$scope.op = angular.copy(curr_data.Op);
	$scope.oldData = angular.copy(curr_data.Data);
	$scope.editData = angular.copy($scope.oldData);

	if  ($scope.oldData["ParentId"] > 0 || $scope.oldData["Func"] == 1){
		$scope.attrDef = [
			{"Key":"Name", "Title":"模块名称", "InputType":"text", "Required":"true"},
			{"Key":"Key", "Title":"模块别名", "InputType":"text", "Required":"true"},
            {"Key":"Sort", "Title":"模块排序", "InputType":"text-i", "Required":"true"},
			{"Key":"Logs", "Title":"日志跟踪", "InputType":"radio", "Value":[[1,"跟踪"],[2,"不跟踪"]]},	
			{"Key":"Description", "Title":"模块备注", "InputType":"textarea"},
		];
	}
    
	if (curr_data.Op=='edit'){
		$scope.title= "编辑模块";
		$scope.postUrl = appCfg.AdminPrefix +"/mode/edit";
	}

}])

;
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
;

app.controller("NodeEditCtrl", ["$scope", "$http", "$filter", "$modalInstance", "curr_data", "appCfg", "configService", "LoginService", function ($scope, $http, $filter, $modalInstance, curr_data, appCfg, configService, LoginService) {
    
	
    
    $scope.cancel = function () {
    	$modalInstance.dismiss("cancel");
    };   
	
    $scope.reset = function() {
    	$scope.editData = angular.copy($scope.oldData);
    };
    
    $scope.change = function(attr) {
    	if (attr.length==0) {
    		for (var attr in $scope.editData) {
    			if (!$scope.oldData.hasOwnProperty(attr)) {
    				return true;
    			}
    			if ($scope.oldData[attr] != $scope.editData[attr]) {
            		return true;
            	}
    		}
        	return false;    		
    	} else {
			if (!$scope.oldData.hasOwnProperty(attr)) {
				return true;
			}
    		if ($scope.oldData[attr] != $scope.editData[attr]) {
        		return true;
        	}
        	return false;
    	}
    	return false;
    };
    
    $scope.save = function() {
 
		$http.post($scope.postUrl, $scope.editData).success(function(data, status, headers, config) {
			if($filter("CheckError")(data)){
				configService.getConfig("Node");
                LoginService.reLogin();
                $modalInstance.close(data);
			} 
		});

    };

	/***********************数据定义*****************************/
	$scope.attrDef = [
			{"Key":"Name", "Title":"节点名称", "InputType":"text"},
			{"Key":"Icon", "Title":"Icon图标", "InputType":"text"},
			{"Key":"Sort", "Title":"排序编号", "InputType":"text"},
			{"Key":"Description", "Title":"备注说明", "InputType":"textarea","Value":{"Rows":4}},
	];	
	
	/***********************初始化*****************************/
	
	$scope.title= "添加节点";
	$scope.postUrl = appCfg.AdminPrefix +"/node/add";

	$scope.op = angular.copy(curr_data.Op);
	$scope.oldData = angular.copy(curr_data.Data);
	$scope.editData = angular.copy($scope.oldData);

	if  ($scope.oldData["ParentId"] > 0 ){
		$scope.attrDef = [
			{"Key":"Name", "Title":"节点名称", "InputType":"text"},
			{"Key":"Url", "Title":"链接地址", "InputType":"text"},
			{"Key":"Sort", "Title":"排序编号", "InputType":"text"},
			{"Key":"Description", "Title":"备注说明", "InputType":"textarea","Value":{"Rows":4}},
		];
	}
    
	if (curr_data.Op=='edit'){
		$scope.title= "编辑节点";
		$scope.postUrl = appCfg.AdminPrefix +"/node/edit";
	}

}])

;
app.controller("PermissionCtrl", ["$scope", "$log", "$window", "$modal", "$routeParams", "$http", "$filter",  "appCfg", "LoginService", "EzConfirm", function ($scope, $log, $window, $modal, $routeParams, $http, $filter, appCfg, LoginService, EzConfirm) {

	$scope.roleId  = parseInt($routeParams.role_id);
	
	$http.get( appCfg.AdminPrefix + '/role/view/'+$scope.roleId).success(function(data, status, headers, config) {
		
		$scope.code = data.Code;
		if( $filter("CheckError")(data) ){	
			$scope.roleData = data.Data.Role; //记录数
			$scope.roleData["Permission"] = $scope.roleData["Permission"] || "[]";
			$scope.roleData["Permission"] =  angular.fromJson($scope.roleData["Permission"]) ;
			

			$scope.modeData = data.Data.Mode;
			$scope.list = {};
			$scope.list = list_2_tree($scope.list, $scope.modeData, 1);
			$scope.list = $scope.list.Childs;
			
			//权限初始化
			for(var i in $scope.list ){
				for(var k in $scope.list[i]["Childs"] ){

					if(angular.isUndefined( $scope.roleData["Permission"][$scope.list[i]["Key"]]) ){
						$scope.roleData["Permission"][$scope.list[i]["Key"]] = {};
						$scope.roleData["Permission"][$scope.list[i]["Key"]][$scope.list[i]["Childs"][k]["Key"]] = false;
					}else if( angular.isUndefined($scope.roleData["Permission"][$scope.list[i]["Key"]][$scope.list[i]["Childs"][k]["Key"]]) ){
						$scope.roleData["Permission"][$scope.list[i]["Key"]][$scope.list[i]["Childs"][k]["Key"]] = false;
					}
				}
			}

		}

			
	});
	

	$scope.save = function(){
		var post = {Id:$scope.roleData["Id"], Permission:angular.toJson( angular.copy($scope.roleData["Permission"]) )};

		$http.post( appCfg.AdminPrefix + '/role/permission/', post).success(function(data, status, headers, config) {
			if( $filter("CheckError")(data) ){	
				if($scope.loginData.Role!='root' && array_obj_find($scope.loginData.Role,"Id",post.Id) !==false ){
					LoginService.reLogin();
				}
				EzConfirm.create({text: '权限数据保存成功！',hiddenFoot:true});

			}
			
		

		});

	};

	$scope.del  = function(id){
		
		EzConfirm.create({text: '确定删除此权限吗？'}).then(function() {
        	$http.get(appCfg.AdminPrefix + '/role/del/'+id).success(function(data, status, headers, config) {
				if( $filter("CheckError")(data) ){	
					return $window.history.back();
				}
			});
        });

	};

	$scope.select = function( $event ){


		for(var i in $scope.roleData["Permission"][$event.target.id] ){
			
			$scope.roleData["Permission"][$event.target.id][i] = $event.target.checked
			
		}
		
	}

}])


;



app.controller("PnodeCtrl",  ["$scope", "$window", "$http", "$filter", "$modal", "$routeParams",  "appCfg", "LoginService", "EzConfirm", function ($scope, $window, $http, $filter, $modal, $routeParams, appCfg, LoginService, EzConfirm) {


	$scope.select = {};
	
	$scope.system = {};

	$http.get( appCfg.AdminPrefix + '/role/view/'+parseInt($routeParams.role_id)).success(function(data, status, headers, config) {

		
		if( $filter("CheckError")(data) ){	
			$scope.roleData = data.Data.Role; //记录数
			var temp = $scope.roleData.Node.split(',');
			for (var i in temp){
				$scope.select[temp[i]] = true;
			}
			
			temp = $scope.roleData.System.split(',');
			for (var i in temp){
				$scope.system[temp[i]] = true;
			}
		}	
		
	});
	



	$scope.getNode = function () {
		
		$scope.list = [];
		var url = appCfg.AdminPrefix + "/node/list";
		$http.get(url).success(function(data, status, headers, config) {
			
			if( $filter("CheckError")(data) ){	
				$scope.itemList = data.Data;
				
				$scope.list = list_2_tree($scope.list, $scope.itemList, 1);
				$scope.list = $scope.list.Childs;
			}
			
		});	
	};



	$scope.save = function(){

		var node = [];
		for (var i in $scope.select){
			if( $scope.select[i] ){
				node.push(i);
			}
		}

		var system = [];
		for (var i in $scope.system){
			if( $scope.system[i] ){
				system.push(i);
			}
		}

		var post = {Id:$scope.roleData["Id"], Node:node.join(","),  System:system.join(",")};

		$http.post( appCfg.AdminPrefix + '/role/node/', post).success(function(data, status, headers, config) {
			if( $filter("CheckError")(data) ){	
				LoginService.reLogin();
				EzConfirm.create({text: '节点数据保存成功！',hiddenFoot:true});
			}
			
		});
		
		
	};



	$scope.getNode();

	

}])
;
app.controller("RoleCtrl", ["$scope", "$http", "$filter", "$modal", "appCfg", "EzConfirm", function ($scope, $http, $filter, $modal, appCfg, EzConfirm) {

	$scope.search = {
						Keyword:"",
						Start:"",
						End:"",
						PageSize:20,//单页条数
						Page:1,//默认当前页为第一页
					};
	
    $scope.getList = function(page) {
		$scope.search.Page = page || $scope.search.Page;
		var url = appCfg.AdminPrefix + "/role/list";
		$http.post(url, $scope.search).success(function(data, status, headers, config) {
			if ($filter("CheckError")(data)){
				$scope.listData= data.Data;
			}
		});	
	};
	
    


    var modalInstance;
	
	$scope.add = function(){

        modalInstance = $modal.open({
            templateUrl: "/static/page/modal/base.html?"+version,
            controller: "RoleEditCtrl",
            backdrop: false,
            resolve: {
            	curr_data: function () {
                    return {"OP":"add","Data":{}}
                }
            }
        }), modalInstance.result.then(function (data) {

			$scope.getList(1);

        });
		
	};

	$scope.edit = function(id, op){
        var op = op || 'edit';
        var url = appCfg.AdminPrefix + "/role/edit/" + id;
		$http.get(url).success(function(data, status, headers, config) {
			if ($filter("CheckError")(data)){
                var temp = data.Data;
                temp.Password = "";
                temp.ConfirmPassword = "";
				modalInstance = $modal.open({
					backdrop: false,
                    templateUrl: "/static/page/modal/base.html?"+version,
                    controller: "RoleEditCtrl",
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



	//角色删除
	$scope.del = function(item) {

		EzConfirm.create({heading: '管理员删除', text: '确定删除此管理员吗？'}).then(function() {
        	var post = angular.copy(item);    	
			var url = appCfg.AdminPrefix + "/role/del";
			$http.post(url, post).success(function(data, status, headers, config) {
				if( $filter("CheckError")(data) ){	
					$scope.getList();
				}
			});		
        });
	};


	$scope.getList($scope.search.Page);
}])
;

app.controller("RoleEditCtrl", ["$scope", "$http", "$filter", "$modalInstance", "curr_data", "appCfg", function ($scope, $http, $filter, $modalInstance, curr_data, appCfg) {

    
    $scope.cancel = function () {
    	$modalInstance.dismiss("cancel");
    };   
	
    $scope.reset = function() {
    	$scope.editData = angular.copy($scope.oldData);
    };
    
    $scope.change = function(attr) {
    	if (attr.length==0) {
    		for (var attr in $scope.editData) {
    			if (!$scope.oldData.hasOwnProperty(attr)) {
    				return true;
    			}
    			if ($scope.oldData[attr] != $scope.editData[attr]) {
            		return true;
            	}
    		}
        	return false;    		
    	} else {
			if (!$scope.oldData.hasOwnProperty(attr)) {
				return true;
			}
    		if ($scope.oldData[attr] != $scope.editData[attr]) {
        		return true;
        	}
        	return false;
    	}
    	return false;
    };
    
    $scope.save = function() {
		$http.post($scope.postUrl, $scope.editData).success(function(data, status, headers, config) {
			if ($filter("CheckError")(data)){
				$modalInstance.close(data);
			}
		});

    };
	/***********************数据定义*****************************/
	$scope.attrDef = [
		  {"Key":"Name", "Title":"名称", "InputType":"text", "Required":"true"},
          {"Key":"Description", "Title":"备注", "InputType":"textarea"},
	];	
	
	/***********************初始化*****************************/	
	$scope.title= "添加角色";
	$scope.postUrl = appCfg.AdminPrefix +"/role/add";

	$scope.op = curr_data.Op;
	$scope.oldData = angular.copy(curr_data.Data);
	$scope.editData = angular.copy($scope.oldData);


	if (curr_data.Op=='edit'){
		$scope.title= "编辑角色";
		$scope.postUrl = appCfg.AdminPrefix +"/role/edit";
	}

}])


;
app.directive("collapseNav", [function () {
    return {
        restrict: "A", link: function (scope, ele) {
            var $a, $aRest, $app, $lists, $listsRest, $nav, $window, prevWidth, updateClass;
            $window = $(window);
			$lists = ele.find("ul").parent("li");
			$a = $lists.children("a");
			$listsRest = ele.children("li").not($lists);
			$aRest = $listsRest.children("a");
			$app = $("#app");
			$nav = $("#nav-container");
			$a.on("click", function (event) {
                var $parent, $this;
               	if( $app.hasClass("nav-collapsed-min") || $nav.hasClass("nav-horizontal") && $window.width() >= 768){
					return !1;
				}
				
				$this = $(this);
				$parent = $this.parent("li");
				console.log($parent);
				$lists.not($parent).removeClass("open").find("ul").slideUp(); 
				$parent.toggleClass("open").find("ul").slideToggle();
				event.preventDefault();
            });

			$aRest.on("click", function () {
                return $lists.removeClass("open").find("ul").slideUp()
            }); 
			scope.$on("nav:reset", function () {
                return $lists.removeClass("open").find("ul").slideUp()
            });
			 
			prevWidth = $window.width(), updateClass = function () {
                var currentWidth;
                return currentWidth = $window.width(), 768 > currentWidth && $app.removeClass("nav-collapsed-min"), 768 > prevWidth && currentWidth >= 768 && $nav.hasClass("nav-horizontal") && $lists.removeClass("open").find("ul").slideUp(), prevWidth = currentWidth
            };
			
			$window.resize(function () {
                var t;
                return clearTimeout(t), t = setTimeout(updateClass, 300)
            })
        }
    }
}]);


;
app.directive("customPage", [function () {
    return {
        restrict: "A", 
		controller: ["$scope", "$element", "$location", function ($scope, $element, $location) {
            var addBg, path;
            return path = function () {
                return $location.path()
            }, 
			addBg = function (path) {
                switch ($element.removeClass("body-wide body-lock"), path) {
                    case"/404":
                    case"/404":
                    case"/500":
                    case"/login":
                        return $element.addClass("body-wide");
                    case"/lock":
                        return $element.addClass("body-wide body-lock")
                }
            }, 
			addBg($location.path()), 
			$scope.$watch(path, function (newVal, oldVal) {
                return newVal !== oldVal ? addBg($location.path()) : void 0
            })
        }]
    }
}]);


;

app.directive('draggable', ['$document', function($document) {
    return function(scope, element, attr) {
	    var startX = 0, startY = 0, x = 0, y = 0;
	    element= angular.element(document.getElementsByClassName("modal-dialog")); 
	    element.css({
	        position: 'relative',
	        cursor: 'move'
	    });
	
	    element.on('mousedown', function(event) {
	        // Prevent default dragging of selected content
	        //event.preventDefault();
			var id= event.target.id;
			if (id.indexOf("draggable")>-1)
			{
				startX = event.pageX - x;
		        startY = event.pageY - y;
		        $document.on('mousemove', mousemove);
		        $document.on('mouseup', mouseup);
			}
	        
	    });
	
	    function mousemove(event) {
	        y = event.pageY - startY;
	        x = event.pageX - startX;
	        element.css({
	        top: y + 'px',
	        left:  x + 'px'
	        });
	    }
	
	    function mouseup() {
	        $document.off('mousemove', mousemove);
	        $document.off('mouseup', mouseup);
	    }
    };
}]);
;
app.directive("datetimepicker",[function(){
    return {
        restrict: "EA",
        require : "ngModel",
        link: function (scope, element, attrs, ctrl) {

            var unregister = scope.$watch(function(){
				var modelValue = ctrl.$modelValue || '';
                $(element).append("<input id='date-"+attrs.dateid+"' class='"+attrs.dateclass+"' placeholder='"+attrs.placeholder+"' value='"+modelValue+"'>");
                $(element).css("padding","0");
				//初始化
			 	$("#date-"+attrs.dateid).datetimepicker({
	                  	format : attrs.format || 'Y-m-d H:i',				//格式化日期
					  	lang : attrs.lang || 'ch', 							//语言选择中文
					  	step :  attrs.step || 15,
					  	hours12 :  attrs.hours12=="true" ? true : false,
					  	timepicker: attrs.showtime=="false" ? false: true, 	//关闭时间选项
 					 	yearStart:	attrs.min || 2000,     					//设置最小年份
     					yearEnd:    attrs.max || 2050,        				//设置最大年份


	                  onClose : function(){
	                      element.change();
	                  }
	              });

                element.on('change', function() {
                    scope.$apply(function() {
                        ctrl.$setViewValue($("#date-"+attrs.dateid).val());
                    });
                });

                element.on('click',function(){
                    $("#date-"+attrs.dateid).datetimepicker({
                        format : attrs.format || 'Y-m-d H:i',
                        onClose : function(){
                            element.change();
                        }
                    });
                });
				//加入下一句有些场景会死循环
                //element.click();

                return ctrl.$modelValue;
            }, initialize);

            function initialize(value){
                ctrl.$setViewValue(value);
                unregister();
            }
        }
    }
}]);
;
app.directive("fullscreenMode", [function () {
    return {
        restrict: "A",
        template: '<a href="javascript:void(0)" ng-click="toggleFullscreen()" class="expand" id="toggle-fullscreen"> <i class="fa fa-expand"></i> </a>',
        controller: ["$scope", function ($scope) {
            $scope.toggleFullscreen = function () {
                $(document).toggleFullScreen();
				$("#toggle-fullscreen .fa").toggleClass("fa-expand fa-compress")
            }
        }]
    }
}])

.directive("uiSpinner", [function () {
    return {
        restrict: "A", compile: function (ele) {
            return ele.addClass("ui-spinner"), {
                post: function () {
                    return ele.spinner()
                }
            }
        }
    }
}]);

;
app.directive("goBack", [function () {
    return {
        restrict: "AE", controller: ["$scope", "$element", "$window", function ($scope, $element, $window) {
            return $element.on("click", function () {
                return $window.history.back()
            })
        }]
    }
}]);


;
app.directive("i18n", ["localize", function (localize) {
    var i18nDirective;
    return i18nDirective = {
        restrict: "EA", updateText: function (ele, input, placeholder) {
            var result;
            return result = void 0, result = void 0, "i18n-placeholder" === input ? (result = localize.getLocalizedString(placeholder), ele.attr("placeholder", result)) : input.length >= 1 ? (result = localize.getLocalizedString(input), ele.text(result)) : void 0
        }, link: function (scope, ele, attrs) {
            return scope.$on("localizeResourcesUpdated", function () {
                return i18nDirective.updateText(ele, attrs.i18n, attrs.placeholder)
            }), attrs.$observe("i18n", function (value) {
                return i18nDirective.updateText(ele, value, attrs.placeholder)
            })
        }
    }
}]);

;

app.directive("slimScroll", [function () {
    return {
        restrict: "A", link: function (scope, ele, attrs) {
            return ele.slimScroll({height: attrs.scrollHeight || "100%"})
        }
    }
}]);

;
app.directive("toggleNavCollapsedMin", ["$rootScope", function ($rootScope) {
    return {
        restrict: "A", link: function (scope, ele) {
            var app;
            return app = $("#app"), 
					ele.on("click", function (e) {
                	return app.hasClass("nav-collapsed-min") ? app.removeClass("nav-collapsed-min") : (app.addClass("nav-collapsed-min"), $rootScope.$broadcast("nav:reset")), e.preventDefault()
            })
        }
    }
}]);


;
app.directive("toggleProfile", [function () {
    return {
        restrict: "A",
        template: '<a href="javascript:void(0)" ng-click="toggleProfile()"> <i class="fa fa-user"></i> </a>',
        controller: ["$scope", function ($scope) {
            $scope.toggleProfile = function () {
                $("#settings").slideToggle()
            }
        }]
    }
}]);
;
app.directive('uiEditObj', [function() {
	return {
		restrict :'AE',
		replace: true,
		scope : {
			attrDef:'=setAttrDef',
			editData:'=setEditData',
			oldData:'=setOldData',
			change: '&',
			changeSelect: '&',
			changeTreeMultipleSel: '&',
			changeGoodsTypeAttr: '&',
			changeCallback: '&'
		},
		templateUrl: "/static/page/modal/ui_edit_obj.html?"+version,
		controller: ["$scope", function($scope) {
		}]
	};

		
	/*
	E（元素）<my-directive></my-directive> 
	A（属性，默认值）<div my-directive="expression"></div>
	C（类名）<div class="my-directive:expression;"></div>
	M（注释）<--directive:my-directive expression-->
	*/
	//directive.scope = false;// 共享父的作用域
	//directive.replace = true; // 指令链接模板是否替换原有元素
	
	/*
	 * ************************************************************************
	 * 输入类型说明
	 * ************************************************************************
	 * 
	 * label：静态  {"Key":"Id", "Title":"编号", "InputType":"label"},
	 * text：单行文本输入 {"Key":"Name", "Title":"名称", "InputType":"text"},
	 * text-i：单行文本输入 {"Key":"Name", "Title":"名称", "InputType":"text-i"},
	 * text-f：单行文本输入 {"Key":"Name", "Title":"名称", "InputType":"text-f"},
	 * radio：单选框 {"Key":"Enabled", "Title":"启用", "InputType":"radio", "Value":[[0,"未启动"],[1,"启动"]]},
	 * checkbox：多选框 {"Key":"Enabled", "Title":"启用", "InputType":"checkbox", "Value":"对对对"},
	 * textarea：多行文本 {"Key":"Name", "Title":"名称43", "InputType":"textarea"},
	 * select：选择框 
	 * 	{"Key":"Enabled", "Title":"启用", "InputType":"select", "Value":[{"Id":0,"Name":"未启动"},{"Id":1,"Name":"启动"}]},
	 * goods-type-attr-sel：选择框 
	 * 	{"Key":"FilterAttr", "Title":"筛选属性", "InputType":"goods-type-attr-sel", "Value":[{"Id":0,"Name":"名称", "Attrs":[{"Id":0,"Name":"名称"}]}]},
	 * 	changeGoodsTypeAttr(Key, Value[i].Id)
	 * upload-img： 图片上传 
	 * {"Key":"Name", "Title":"名称", "InputType":"upload-img", "Value":{"Width":138,"Height":138,"Force":1,"Quality":0.7}},
		Width：需要切割的宽度
		Height：需要切割的高度
		Force ：是否强制切割，如果选择为0，会按照宽高比例切割，否则强制按照配置的宽高切割
		Quality：切割品质
		回调接口：changeCallback(img)  只需要在上传图片的ctrl中实现changeCallback回调接口便可，例如：
		
		$scope.changeCallback = function(img) {
			$scope.editData["Photo"] = img.resized.dataURL
		};
		img参数为图片对象：
		{"dataUrl":原始图片数据,"file":{"lastModifiedDate":"最后修改时间","name":"图片名称","size":"图片大小","type":"图片类型"},"resized":{"dataUrl":切割后的图片数据,"type":"图片类型"}}
		

		
	 * tree-multiple-sel：树状多选输入
	 * {
	 * "Key":"Enabled", 
	 * "Title":"启用", 
	 * "InputType":"tree-multiple-sel", 
	 * "Value":{"Tree":[{"Id":1, "Name":"名称", "Sel选中状态":true, "Childs":[]}]}
	 * }
	 * changeTreeMultipleSel(item.Key, Id)
	 *
	 * ************************************************************************
		$scope.attrDef = [
		{"Key":"Id", "Title":"编号", "InputType":"label"},
		{"Key":"Name", "Title":"名称", "InputType":"text"},
		{"Key":"Name", "Title":"名称43", "InputType":"textarea"},
		{"Key":"Enabled", "Title":"启用", "InputType":"radio", "Value":[[0,"未启动"],[1,"启动"]]},	
		{"Key":"IsDel", "Title":"删除", "InputType":"radio", "Value":[[0,"未删除"],[1,"删除"]]},
		{"Key":"Photo", "Title":"头　像", "InputType":"upload-img", "Value":{"Width":138,"Height":138,"Force":1,"Quality":0.7}},
		{"Key":"Date", "Title":"日期", "InputType":"date"},
		{"Key":"Money", "Title":"项目金额", "InputType":"money", "Symbol":"¥", "Required":"true"},	

		];
		$scope.oldData = 
		$scope.editData = 
	*/
}]);
;

app.factory("localize", ["$http", "$rootScope", "$window", function ($http, $rootScope, $window) {
    var localize;
    return localize = {
        language: "", 
		resourceFileLoaded: !1, 
		successCallback: function (data) {
            return localize.dictionary = data, localize.resourceFileLoaded = !0, $rootScope.$broadcast("localizeResourcesUpdated")
        }, 
		setLanguage: function (value) {
            return localize.language = value.toLowerCase().split("-")[0], localize.initLocalizedResources()
        }, 
		setUrl: function (value) {
            return localize.url = value, localize.initLocalizedResources()
        }, 
		buildUrl: function () {
            return localize.language || (localize.language = ($window.navigator.userLanguage || $window.navigator.language).toLowerCase(), localize.language = localize.language.split("-")[0]), "i18n/resources-locale_" + localize.language + ".js"
        }, 
		initLocalizedResources: function () {
            var url;
            return url = localize.url || localize.buildUrl(), $http({
                method: "GET",
                url: url,
                cache: !1
            }).success(localize.successCallback).error(function () {
                return $rootScope.$broadcast("localizeResourcesUpdated")
            })
        }, 
		getLocalizedString: function (value) {
            var result, valueLowerCase;
            return localize.dictionary && value ? (valueLowerCase = value.toLowerCase(), result = "" === localize.dictionary[valueLowerCase] ? value : localize.dictionary[valueLowerCase]) : result = value, result
        }
    }
}]);
;
//过滤器模块（类似于模板函数定义）
app.filter('AlertError', ["EzConfirm", function(EzConfirm) {  
   return function(msg) {  
      EzConfirm.create({heading: '错误提示', text: msg, cancelBtn:'',confirmBtn:'知道了'});
   };  
 }]);
;
//过滤器模块（类似于模板函数定义）
app.filter('AppCfgFind', ["appCfg", function(appCfg) {  
   return function(id, obj) {  
      return array_obj_find(appCfg[obj], "Id", id)["Name"];  
   };  
 }]);
;
app.filter('ArrayObjArray', [function() {  
	return function(a,k,v) {  
		if (v == 0 || v== "" || angular.isUndefined(v) || v == null) return a;
		return array_obj_array(a, k, v);
   };  
 }]);
;
app.filter('ArrayObjFind', [function() {  
	return function(id, obj, key, field) {  
		field = field || "Name"	;
	  	var name = array_obj_find(obj, key, id)[field] || "无";
		
		return name;
   };  
 }]);
;
//过滤器模块（类似于模板函数定义）
app.filter('CheckError', ["EzConfirm", function(EzConfirm) {  
   return function(data) { 
       if (data.Code != 1){
           EzConfirm.create({heading: '错误提示', text: data.Msg, cancelBtn:'',confirmBtn:'知道了'});
           return false;
       }
       return true;
   };  
}]);
;

app.filter('FindName', [function() {  
	return function(id, obj, field) {  
		field = field || "Name"	;
	  	var name = array_obj_find(obj, "Id", id)[field] || "无";
		
		return name;
   };  
 }]);

;
 app.filter("PropsFilter", [function () {
    return function (items, props) {
        var out;
        return out = [], angular.isArray(items) ? items.forEach(function (item) {
            var i, itemMatches, keys, prop, text;
            for (itemMatches = !1, keys = Object.keys(props), i = 0; i < keys.length;) {
                if (prop = keys[i], text = props[prop].toLowerCase(), -1 !== item[prop].toString().toLowerCase().indexOf(text)) {
                    itemMatches = !0;
                    break
                }
                i++
            }
            itemMatches && out.push(item)
        }) : out = items, out
    }
}]);
;
app.filter('Split', [function() {  
	return function(str, field) {
		str = str || ""; 
		return str.split(field); 
   };  
 }]);


;
app.service('configService', ["$rootScope", "$http", "$filter", "appCfg", function($rootScope, $http, $filter, appCfg) {
    
    
	var self = this;
	
	this.data = {"Admin":[], "Role":[], "Mode":[], "Node":[]};
	
	this.getConfig = function(type) {
        var url = appCfg.AdminPrefix + "/public/config";
        if (angular.isDefined(type) && type != ""){
            url = appCfg.AdminPrefix + "/public/config/" + type;
        }
		
		
		return $http.get(url).success(function(data, status, headers, config) {
			if(data.Code==1) {
                 if (angular.isDefined(type) && type != ""){
                    self.data[type] = data.Data;
                 }else{
                     self.data = data.Data;
                 }
                
               
			} else {
				$filter("AlertError")(data.Msg);
			}
		});
	};

	this.getConfig();
}]);


;

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