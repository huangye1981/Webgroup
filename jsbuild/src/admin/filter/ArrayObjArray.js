app.filter('ArrayObjArray', [function() {  
	return function(a,k,v) {  
		if (v == 0 || v== "" || angular.isUndefined(v) || v == null) return a;
		return array_obj_array(a, k, v);
   };  
 }]);