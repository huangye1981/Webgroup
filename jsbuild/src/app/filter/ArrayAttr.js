app.filter('arrayAttr', [function() {  
	   return function(id, array, attr) {
	      for (var i=0; i<array.length; i++) {
	    	  if (array[i].Id==id) {
	    		  return array[i][attr];
	    	  }
	      }
	      return "无";
	   };  
	}]);
