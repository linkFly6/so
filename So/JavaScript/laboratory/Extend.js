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
    //对象合并方法
    var extend = function () {
        new Array().shift();
        //主要在copy开始前不要尝试改变args，否则length很难维护
        var args = Array.prototype.slice.call(arguments, 0),
            length = args.length,  //长度
            target = args[0] || {}, //目标对象
            i = 1,                      //开始索引
            deep = false,               //深度
            source, key, src, copy;
        if (typeof target === 'boolean') {//判断第一个参数是否是boolean
            deep = target;
            target = args[i] || {};
            i++;
        }
        if (args.length === 1) {
            target = !this.setInterval ? this : {}; //如果只有一个对象，那么就是this
            i--;
        }
        //开始copy
        while ((source = args[i++])) {
            for (key in source) {
                copy = source[key];
                //防止自我引用
                if (target === copy) continue;
                //不支持数组,但支持深copy
                if (deep && copy && Object.prototype.toString.call(copy) === '[object object]') {
                    src = Object.prototype.toString.call(target[key]) === '[object object]' ? src : {};
                    target[key] = extend(deep, src, copy);
                } else
                    target[key] = copy; //同名属性会被覆盖
            }
        }
        return target;
    };


    //让一段代码执行到linkFly环境
    window.$ = window.$ || {};
    window.$.extend = extend;
    //为什么这个上传不上来？？？
})(window);
