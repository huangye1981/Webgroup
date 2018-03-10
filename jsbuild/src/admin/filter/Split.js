app.filter('Split', [function() {  
	return function(str, field) {
		str = str || ""; 
		return str.split(field); 
   };  
 }]);

