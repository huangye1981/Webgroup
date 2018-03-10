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