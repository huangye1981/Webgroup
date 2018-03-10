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