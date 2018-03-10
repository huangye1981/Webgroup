//过滤器模块（类似于模板函数定义）
app.filter('AppCfgFind', ["appCfg", function(appCfg) {  
   return function(id, obj) {  
      return array_obj_find(appCfg[obj], "Id", id)["Name"];  
   };  
 }]);