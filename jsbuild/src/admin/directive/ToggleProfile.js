app.directive("toggleProfile", [function () {
    return {
        restrict: "A",
        template: '<a href="javascript:void(0)" ng-click="toggleProfile()"> <i class="fa fa-user"></i> </a>',
        controller: ["$scope", function ($scope) {
            $scope.toggleProfile = function () {
                $("#settings").slideToggle()
            }
        }]
    }
}]);