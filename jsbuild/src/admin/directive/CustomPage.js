app.directive("customPage", [function () {
    return {
        restrict: "A", 
		controller: ["$scope", "$element", "$location", function ($scope, $element, $location) {
            var addBg, path;
            return path = function () {
                return $location.path()
            }, 
			addBg = function (path) {
                switch ($element.removeClass("body-wide body-lock"), path) {
                    case"/404":
                    case"/404":
                    case"/500":
                    case"/login":
                        return $element.addClass("body-wide");
                    case"/lock":
                        return $element.addClass("body-wide body-lock")
                }
            }, 
			addBg($location.path()), 
			$scope.$watch(path, function (newVal, oldVal) {
                return newVal !== oldVal ? addBg($location.path()) : void 0
            })
        }]
    }
}]);

