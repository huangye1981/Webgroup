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