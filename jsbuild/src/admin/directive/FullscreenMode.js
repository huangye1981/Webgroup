app.directive("fullscreenMode", [function () {
    return {
        restrict: "A",
        template: '<a href="javascript:void(0)" ng-click="toggleFullscreen()" class="expand" id="toggle-fullscreen"> <i class="fa fa-expand"></i> </a>',
        controller: ["$scope", function ($scope) {
            $scope.toggleFullscreen = function () {
                $(document).toggleFullScreen();
				$("#toggle-fullscreen .fa").toggleClass("fa-expand fa-compress")
            }
        }]
    }
}])

.directive("uiSpinner", [function () {
    return {
        restrict: "A", compile: function (ele) {
            return ele.addClass("ui-spinner"), {
                post: function () {
                    return ele.spinner()
                }
            }
        }
    }
}]);
