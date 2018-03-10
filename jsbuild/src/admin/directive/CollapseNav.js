app.directive("collapseNav", [function () {
    return {
        restrict: "A", link: function (scope, ele) {
            var $a, $aRest, $app, $lists, $listsRest, $nav, $window, prevWidth, updateClass;
            $window = $(window);
			$lists = ele.find("ul").parent("li");
			$a = $lists.children("a");
			$listsRest = ele.children("li").not($lists);
			$aRest = $listsRest.children("a");
			$app = $("#app");
			$nav = $("#nav-container");
			$a.on("click", function (event) {
                var $parent, $this;
               	if( $app.hasClass("nav-collapsed-min") || $nav.hasClass("nav-horizontal") && $window.width() >= 768){
					return !1;
				}
				
				$this = $(this);
				$parent = $this.parent("li");
				console.log($parent);
				$lists.not($parent).removeClass("open").find("ul").slideUp(); 
				$parent.toggleClass("open").find("ul").slideToggle();
				event.preventDefault();
            });

			$aRest.on("click", function () {
                return $lists.removeClass("open").find("ul").slideUp()
            }); 
			scope.$on("nav:reset", function () {
                return $lists.removeClass("open").find("ul").slideUp()
            });
			 
			prevWidth = $window.width(), updateClass = function () {
                var currentWidth;
                return currentWidth = $window.width(), 768 > currentWidth && $app.removeClass("nav-collapsed-min"), 768 > prevWidth && currentWidth >= 768 && $nav.hasClass("nav-horizontal") && $lists.removeClass("open").find("ul").slideUp(), prevWidth = currentWidth
            };
			
			$window.resize(function () {
                var t;
                return clearTimeout(t), t = setTimeout(updateClass, 300)
            })
        }
    }
}]);

