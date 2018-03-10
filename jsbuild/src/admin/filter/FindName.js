
app.filter('FindName', [function() {  
	return function(id, obj, field) {  
		field = field || "Name"	;
	  	var name = array_obj_find(obj, "Id", id)[field] || "无";
		
		return name;
   };  
 }]);
