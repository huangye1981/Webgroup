
app.controller("FilesEditCtrl", ["$scope", "$http", "$filter", "$modalInstance", "curr_data", "appCfg", function ($scope, $http, $filter, $modalInstance, curr_data, appCfg) {
	
	
    $scope.cancel = function () {
    	$modalInstance.dismiss("cancel");
    };   
	
    $scope.reset = function() {
    	$scope.editData = angular.copy($scope.oldData);
    };

    $scope.loading = false;

    $scope.change = function(attr) {
		if ($scope.loading) return false;
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
    $scope.dataUrl = "";

	$scope.save = function() {
		$scope.loading = true;

		$("#ihtml img").each(function(){
			this.src = "/admin/public/getimg?Imgsrc="+this.src;
		});

		var node = document.getElementById('ihtml');
		domtoimage.toPng(node).then(function (dataUrl) {
			$scope.editData["Photo"] = dataUrl;
			$scope.dataUrl = dataUrl;
			$http.post($scope.postUrl, $scope.editData).success(function(data, status, headers, config) {
				if($filter("CheckError")(data)){
					$modalInstance.close(data);
				}
			});

		}).catch(function (error) {
			console.error('oops, something went wrong!', error);
		});

	};

	$scope.iframeLoadedCallBack = function(){
		console.log(88888888888);
		$("#ihtml")[0].contentWindow.createImg();
	};

    $scope.save2 = function() {

		$scope.loading = true;

		//$scope.iframeUrl = "/files/createiframe?content=" + $scope.editData["Content"];

		var doc = document.getElementById("ihtml").contentDocument || document.frames["ihtml"].document;
		//$("#ihtmlBody", doc).html($scope.editData["Content"]);

		doc.body.innerHTML = $scope.editData["Content"];
		/*
		$("#ihtmlBody img", doc).each(function(){
			this.src = "/admin/public/getimg?Imgsrc="+this.src;
			//this.src = "/static/img/user6.png";
		});

		//$("#ihtml")[0].contentWindow.createImg();
		*/
    };

	$scope._simpleConfig = {
            //这里可以选择自己需要的工具按钮名称,此处仅选择如下五个
            toolbars:[[ 'source', '|', 'undo', 'redo', '|',
            'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'removeformat', '|', 'forecolor', 'backcolor','|', 'insertorderedlist', 'insertunorderedlist', '|',
            'customstyle', 'paragraph', 'fontfamily', 'fontsize', 'lineheight', 
            'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'touppercase', 'tolowercase', '|',
            'link', 'unlink', 'anchor', '|', 'imagenone', 'imageleft', 'imageright', 'imagecenter', '|',
            'simpleupload', 'insertimage', 'emotion', 'scrawl', 'pagebreak', 'template', 'background', '|',
            'horizontal', 'date', 'time', 'spechars', 'snapscreen', 'wordimage', '|',
            'inserttable', 'deletetable', 'insertparagraphbeforetable', 'insertrow', 'deleterow', 'insertcol', 'deletecol', 'mergecells', 'mergeright', 'mergedown', 'splittocells', 'splittorows', 'splittocols', 'charts', '|',
            'selectall', 'cleardoc', 'preview']],
            initialFrameWidth:'100%',
            initialFrameHeight:320,
            //focus时自动清空初始化时的内容
            autoClearinitialContent:true,
            //关闭字数统计
            wordCount:false,
            //关闭elementPath
            elementPathEnabled:false
      };


	/***********************数据定义*****************************/
	$scope.attrDef = [
		{"Key":"Title", "Title":"标题", "InputType":"text", "Required":"true"},
		{"Key":"Keywords", "Title":"关键字", "InputType":"text", "Required":"false"},
		{"Key":"Description", "Title":"简介", "InputType":"text", "Required":"false"},
		{"Key":"Href", "Title":"跳转", "InputType":"text", "Required":"true"},
		{"Key":"Content", "Title":"内容", "InputType":"ueditor", "Required":"false", "Config":$scope._simpleConfig},
		{"Key":"Note", "Title":"备注", "InputType":"textarea", "Required":"false"},
		{"Key":"Sort", "Title":"排序", "InputType":"text-i", "Required":"true", "Min":1, "Max":100},

	];	
	
	/***********************初始化*****************************/
	$scope.title = "添加软文";
	$scope.op =  angular.copy(curr_data.Op);
	$scope.oldData = angular.copy(curr_data.Data);
	$scope.editData = angular.copy($scope.oldData);
    $scope.postUrl = appCfg.AppPrefix +"/files/add";

	if (curr_data.Op=='edit'){
		$scope.title= "编辑软文";
		$scope.postUrl = appCfg.AppPrefix +"/files/edit";
	}



}])