//过滤器模块（类似于模板函数定义）
app.filter('AlertError', ["EzConfirm", function(EzConfirm) {  
   return function(msg) {  
      EzConfirm.create({heading: '错误提示', text: msg, cancelBtn:'',confirmBtn:'知道了'});
   };  
 }]);