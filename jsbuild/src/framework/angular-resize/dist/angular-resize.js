angular.module("rt.resize", []).factory("resize", ["$window", "$timeout", function ($window, $timeout) {
    return function ($scope) {
        var fns = [];

        function callAll() {
            for (var i = 0; i < fns.length; i++) {
                fns[i]();
            }
        }

        // Bind to window.resize
        var window = angular.element($window);
        window.bind("resize", callAll);

        // Unbind when scope goes away.
        $scope.$on("$destroy", function () {
            window.unbind("resize", callAll);
        });

        return {
            call: function (fn) {
                fns.push(fn);
                $timeout(fn);
                return this;
            }
        };
    };
}]);
