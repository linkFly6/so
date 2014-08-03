(function (window, undefined) {
    //继承并扩展一个Array对象
    var ExArray = function () { };
    ExArray.prototype = new Array();
    ExArray.prototype.constructor = ExArray;
    ExArray.prototype.each = function (fn) {
        for (var i = 0, len = this.length; i < len; i++) {
            fn.call(this[i], i);
        }
    };


    //让一段代码执行到linkFly环境


})(window);