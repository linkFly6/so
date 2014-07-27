(function (window, undefined) {
    var window = window,
    document = window.document,
    class2type = {}; //基础类型列表
    //——————————————————————————————————判定数据系列————————————————————————————————
    var getType = function (obj) {
        /// <summary>
        ///     1: 获取基本类型的数据
        ///     &#10;    1.1 - getType(obj)
        /// </summary>
        /// <param name="obj" type="Object">
        ///     要获取基本类型的对象
        /// </param>
        /// <returns type="String" />
        return obj == null ?
			String(obj) :
			class2type[toString.call(obj)] || "object";
        //class2type在页面定义
    };

    var each = function (array, fn) {
        /// <summary>
        ///     1: 循环一组对象
        ///     &#10;    1.1 - each(arr, fn)
        /// </summary>
        /// <param name="array" type="Array">
        ///     要循环的（类）数组
        /// </param>
        /// <param name="fn" type="Function">
        ///     每个循环项的回调函数
        /// </param>
        /// <returns type="jQuery" />
    };
    each('Boolean Number String Function Array Date RegExp Object'.split(' '), function (i) {
        class2type["[object " + name + "]"] = this.toLowerCase();
    });

    // - 判定一个对象是否是Function
    var isFunction = (function () { // Performance optimization: Lazy Function Definition 
        return "object" === typeof document.getElementById ?
        isFunction = function (fn) {
            //ie下对DOM和BOM的识别有问题
            try {
                return /^\s*\bfunction\b/.test("" + fn);
            } catch (x) {
                return false
            }
        } :
            isFunction = function (fn) { return getType(fn) === 'function'; };
    })(); //注意这是个自执行函数

    // - 判定一个对象是否为Array
    var isArray = function (obj) { return getType(obj) === 'array'; };
    // - 判定一个对象是否为Window
    var isWindow = function (obj) {
        //简单的判定
        //        return obj != null && obj == obj.window;
        //准确的判定
        var temp = String(obj);
        return temp === '[object Window]'   //ff
        || temp === '[object DOMWindow]'    //safai
        || temp === '[object global]'       //chrome
        || (temp == document && document != temp);  //ie678 - ie神奇的hack : window==document但是document!=window
    };

    // - 判定一个对象是否是类数组对象
    var isArrayLike = function (obj) {
        var length = obj.length, type = getType(obj);
        return type === 'array' || !isFunction(obj) &&
        (+length === length && //正数
        !(length % 1) && //整数
        (length - 1) in obj); //可以被索引
    };

    //——————————————————————————————————数据类型判定结束——————————————————————————————————


    //——————————————————————————————————DOMReady——————————————————————————————————————






    //——————————————————————————————————DOMReady结束————————————————————————————————————
})(window);