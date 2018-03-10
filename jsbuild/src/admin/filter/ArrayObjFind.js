app.filter('ArrayObjFind', [function() {  
	return function(id, obj, key, field) {  
		field = field || "Name"	;
	  	var name = array_obj_find(obj, key, id)[field] || "无";
		
		return name;
   };  
 }]);