app.directive("flotChart", [function () {
    return {
        restrict: "A", scope: {data: "=", options: "="}, link: function (scope, ele) {
            var data, options, plot;
            return data = scope.data, options = scope.options, plot = $.plot(ele[0], data, options)
        }
    }
}]);