app.directive('zyupload', ["$rootScope",function($rootScope) {
    return {
        restrict: 'E',
        template: '<div id="zyupload" class="zyupload"></div>',
        link:function(scope, element, attrs){
                
				// 初始化插件
				$("#zyupload").zyUpload({
					width: "100%", 							// 宽度 
				    height: "100%", 						// 高度 
				    itemWidth: "100px", 					// 文件项的宽度 
				    itemHeight: "80px", 					// 文件项的高度 
				    url: "/admin/album/add", 				// 上传文件的路径 
				    fileType: ["jpg", "png"], 	// 上传文件的类型 
				    fileSize: 51200000, 					// 上传文件的大小 
				    multiple: true, 						// 是否可以多个文件上传 
				    dragDrop: false, 						// 是否可以拖动上传文件 
				    tailor: false, 							// 是否可以裁剪图片 
				    del: true, 								// 是否可以删除文件 
				    finishDel: true, 						// 是否在上传文件完成后删除预览 
					/* 外部获得的回调接口 */
					onSelect: function(files, allFiles){                    // 选择文件的回调方法
						
						console.info("当前选择了以下文件：");
						console.info(files);
						console.info("之前没上传的文件：");
						console.info(allFiles);
					},
					onDelete: function(file, surplusFiles){                     // 删除一个文件的回调方法
						console.info("当前删除了此文件：");
						console.info(file);
						console.info("当前剩余的文件：");
						console.info(surplusFiles);
					},
					onSuccess: function(file, responseInfo ){                    // 文件上传成功的回调方法
						$rootScope.$broadcast("uploadSuccess", responseInfo);
						console.info("此文件上传成功：");
						console.info(file);
					},
					onFailure: function(file){                    // 文件上传失败的回调方法
						console.info("此文件上传失败：");
						console.info(file);
					},
					onComplete: function(responseInfo){           // 上传完成的回调方法
						$rootScope.$broadcast("uploadComplete", responseInfo);
						console.info("文件上传完成");
						console.info(responseInfo);
					}
				});
               
        }
    };
}])

