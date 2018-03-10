app.directive("toggleNavCollapsedMin", ["$rootScope", function ($rootScope) {
    return {
        restrict: "A", link: function (scope, ele) {
            var app;
            return app = $("#app"), 
					ele.on("click", function (e) {
                	return app.hasClass("nav-collapsed-min") ? app.removeClass("nav-collapsed-min") : (app.addClass("nav-collapsed-min"), $rootScope.$broadcast("nav:reset")), e.preventDefault()
            })
        }
    }
}]);

