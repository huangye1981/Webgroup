app.directive("goBack", [function () {
    return {
        restrict: "AE", controller: ["$scope", "$element", "$window", function ($scope, $element, $window) {
            return $element.on("click", function () {
                return $window.history.back()
            })
        }]
    }
}]);

