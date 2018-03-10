/*
对象数组查询
var data = [{"name":"1","sex":1},{"name":"2","sex":2},{"name":"3","sex":3}]
var test = array_obj_find(data,"name", "2");
alert(test["name"]);
*/
function array_obj_find(a, k, v, key)
{
	for (i in a)
	{
		if (a[i][k] == v){
			if (key) {
				return i
			}else{
				return a[i]
			} 
		}
	}
	return false
}

function array_obj_array(a, k, v)
{
	var temp = [];
	for (i in a)
	{
		if (a[i][k] == v){
			temp.push(a[i]);		
		}
	}
	return temp;
}

/*
 * 将数组列表，变成树结构 {"Id":-1~N, "ParentId":>0, "TempLevel":1~N, "Childs":[]}
 */
function list_2_tree(node, list, level) {
	list= list || [];
	var is_root = false;
	if (!node.hasOwnProperty("Id")) {
		node = {"Id":-1, "Childs":[]};
		is_root = true;
	}
	
	for (var i=0; i<list.length; i++) {
		
		if (list[i]["ParentId"] == node["Id"]) {
			
			var new_child = angular.copy(list[i]);
			new_child["Childs"] = new Array();
			new_child["TempLevel"] = level;
			
			
			list_2_tree(new_child, list, level+1);
			node["Childs"].push(new_child);		
		}
	}
	if (is_root) {
		return node;
	}
};




/*
 * 把树变成 顺序数组
 * {"Id":1, "ParentId":-1}
 * {"Id":12, "ParentId":1}
 * {"Id":13, "ParentId":1}
 * {"Id":2, "ParentId":-1}
 * {"Id":22, "ParentId":2}
 * {"Id":23, "ParentId":2}
 */
function tree_2_array(array, tree_node) {
	var is_root = false;
	if (tree_node["Id"] == -1) {
		is_root = true;
	}
	
	if (tree_node["Id"] != -1) {
		var obj = {};
		for(var attr in tree_node) {
			if (attr != "Childs") {
				obj[attr] = tree_node[attr];
			}
		}
		array.push(obj);
	}
	
	if (tree_node.hasOwnProperty("Childs")) {
		for (var i=0; i<tree_node["Childs"].length; i++) {
			tree_2_array(array, tree_node["Childs"][i]);
		}    		
	}
	if (is_root) {
		return array;
	}
};

function is_undefined(obj) {
	if (typeof(obj) == "undefined") {
		return true;
	}
	return false;
}


// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


