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

    //——————————————————————————————————Array数组——————————————————————————————————
    //这里总得干点什么吧...直接创建一个类数组？
    var List = function () {
        /// <summary>
        ///     1: 将参数转换为List对象，这个函数无论成功与否都会创建一个类数组对象返回，即使length===0
        ///     &#10;    1.1 - new List(Array) - 将数组转换为List对象，支持类数组
        ///     &#10;    1.3 - new List(elem,[ elem1,[, elem2[, elemN ]]]) - 将两个数组拼接为一个List对象
        /// </summary>
        /// <param name="fn" type="Function">
        ///     每个循环项的回调函数
        /// </param>
        /// <returns type="List" />
        var res = [], len = arguments.length, array = arguments[0], i = 0;
        if (len) {
            if (len === 1) {
                //修正len
                len = array.length;
                //这里可以来一层对象判定？
                if (len == null || getType(array) === 'string' || isFunction(array) || isWindow(array)) {
                    res[0] = array;
                } else {
                    while (i++ < len)//利用i++非常低的优先级
                        res[i] = array[i];
                }
            } else {
                while (i++ < len)
                    res[i] = arguments[i];
            }
        }
        return res;
    },
    isIndexOf = Array.prototype.indexOf;        //es5

    //这个一定要有，判定是否是自己
    List.isList = function () {

    };

    //构造函数已经返回的数组，所以不用在修正原型链了
    //    List.prototype = new Array(); //从原型中创建一个Array，所有保有Array的特性
    List.prototype.constructor = List; //修正list
    // - 扩展each方法，基础方法
    List.prototype.each = function (fn) {
        /// <summary>
        ///     1: 循环一组List对象
        ///     &#10;    1.1 - each(fn)
        /// </summary>
        /// <param name="fn" type="Function">
        ///     每个循环项的回调函数
        /// </param>
        /// <returns type="List" />
        for (var i = 0, len = this.length; i < len; i++) {
            fn.call(this[i], this[i], i);
        }
        return this;
    };

    // - 检测数据中是否包含某项，返回该项索引，如果没有，则返回-1，这个函数没有预编译是因为要保证作用域(this的作用域)
    //index表示开始要遍历查找的起点，用于加快访问速度（例如多次查找，可以缓存第一次的索引，第二次查找建立在第一次查找之上）
    List.prototype.indexOf = isIndexOf ? function (elem, index) {//存在es5方法
        if (this.length)
            return isIndexOf.call(this, elem, index);
    } : function (elem, index) {
        var len = this.length;
        if (len) {
            //修正查找索引
            index = index ?
                index < 0 ? //负索引表示倒数
                    Math.max(0, len + index) : index
                : 0;
            for (; index < len; index++) {
                //当数组中可以找到该项索引并且该索引的元素等于要查找的元素，返回该索引
                if (index in this && this[index] === elem)
                    return index;
            }
        }
        return -1;
    };

    List.prototype.removeAt = function () {

    };
    List.prototype.remove = function () {

    };
    List.prototype.random = function () {

    };




    //——————————————————————————————————Array数组结束——————————————————————————————————————


    //格式化字符串方法，使用：${0},${1}、${name},${value}
    var format = function (str, object) {
        /// <summary>
        ///     1: format(str,object) - 格式化一组字符串，参阅C# string.format()
        ///     &#10;    1.1 - format(str,object) - 通过对象格式化
        ///     &#10;    1.2 - format(str,Array) - 通过数组格式化
        /// </summary>
        /// <param name="str" type="String">
        ///     格式化模板(字符串模板)
        /// </param>
        /// <param name="object" type="Object">
        ///     Object:使用对象的key格式化字符串，模板中使用${name}占位：${data},${value}
        ///     Array:使用数组格式化，模板中使用${Index}占位：${0},${1}
        /// </param>
        /// <returns type="String" />
        var array = Array.prototype.slice.call(arguments, 1);
        //可以被\符转义
        return str.replace(/\\?\${([^{}]+)\}/gm, function (match, key) {
            //匹配转义符"\"
            if (match.charAt(0) == '\\')
                return match.slice(1);
            var index = Number(key);
            if (index >= 0)
                return array[index];
            return object[key] !== undefined ? object[key] : match;
        });
    };





    //——————————————————————————————————DOMReady结束————————————————————————————————————



    //——————————————————————————————————DOMReady——————————————————————————————————————






    //——————————————————————————————————DOMReady结束————————————————————————————————————


    //——————————————————————————————————封装一个——————————————————————————————————————






    //——————————————————————————————————DOMReady结束————————————————————————————————————

})(window);