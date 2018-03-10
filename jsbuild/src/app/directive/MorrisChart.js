app.directive("morrisChart", [function () {
    return {
        restrict: "A", scope: {data: "=", type: "=", options: "="}, link: function (scope, ele) {
            var data, func, options, type;
            switch (data = scope.data, type = scope.type) {
                case"line":
                    return options = angular.extend({
                        element: ele[0],
                        data: data
                    }, scope.options), new Morris.Line(options);
                case"area":
                    return options = angular.extend({
                        element: ele[0],
                        data: data
                    }, scope.options), new Morris.Area(options);
                case"bar":
                    return options = angular.extend({
                        element: ele[0],
                        data: data
                    }, scope.options), new Morris.Bar(options);
                case"donut":
                    return options = angular.extend({
                        element: ele[0],
                        data: data
                    }, scope.options), options.formatter && (func = new Function("y", "data", options.formatter), options.formatter = func), new Morris.Donut(options)
            }
        }
    }
}]);