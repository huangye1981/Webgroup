 app.filter("PropsFilter", [function () {
    return function (items, props) {
        var out;
        return out = [], angular.isArray(items) ? items.forEach(function (item) {
            var i, itemMatches, keys, prop, text;
            for (itemMatches = !1, keys = Object.keys(props), i = 0; i < keys.length;) {
                if (prop = keys[i], text = props[prop].toLowerCase(), -1 !== item[prop].toString().toLowerCase().indexOf(text)) {
                    itemMatches = !0;
                    break
                }
                i++
            }
            itemMatches && out.push(item)
        }) : out = items, out
    }
}]);