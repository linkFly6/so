(function (window, undefined) {
    /*
    * 一个回调函数工具对象，注意这个工作对象工作完成之后就会清空数组:
    *   提供一组普通的API，但它有如下工作模型 - 
    *                     once - 单次执行模型：每次工作一次，后续不再工作
    *                     auto - 自动执行模型：每添加一个回调函数，自动执行现有的回调函数集合里的所有回调函数，并将本次的参数传递给所有的回调函数
    *
    */

    //工具函数
    var isIndexOf = Array.prototype.indexOf,    //Es6
        toString = Object.prototype.toString,   //缓存toString方法
        toSlice = Array.prototype.slice,        //缓存slice方法
        isFunction = (function () {             //判定一个对象是否是Function
            return "object" === typeof document.getElementById ?
            isFunction = function (fn) {
                //ie下对DOM和BOM的识别有问题
                try {
                    return /^\s*\bfunction\b/.test("" + fn);
                } catch (x) {
                    return false
                }
            } :
            isFunction = function (fn) { return toString.call(fn) === '[object Function]'; };
        })(),
        each = function () {                    //循环遍历方法
            //第一个参数表示要循环的数组，第二个参数是每次循环执行的函数
            if (arguments.length < 2 || !isFunction(arguments[1])) return;
            //为什么slice无效？？
            var list = toSlice.call(arguments[0]), fn = arguments[1], item = list.shift();
            while (list.length) {
                fn.apply(item, item);
            }
        },
        inArray = function () {                     //检测数组中是否包含某项，返回该项索引
            //预编译
            return isIndexOf ? function (array, elem, i) {
                if (array)
                    return isIndexOf.call(array, elem, i);
                return -1;
            } : function (elem, array, i) {
                var len;
                if (array) {
                    len = array.length;
                    i = i ? i < 0 ? Math.max(0, len + i) : i : 0;
                    for (; i < len; i++) {
                        if (i in array && array[i] === elem) {
                            return i;
                        }
                    }
                }
                return -1;
            }
        } ();

    var callbacks = function (option) {
        option = typeof option === '[object Object]' ? option : {};
        //使用闭包，因为每个新建的callbacks都有自己的状态
        var list = [],      //回调列表
            _list = [],     //如果锁定这个callbacks对象，则清空list，将原list置入_list
            fired,          //是否执行过
            firingStart,    //当前回调函数列表执行的函数索引（起点）
            firingLength,   //回调函数的数组长度
            auto,   //标志是否自动执行，如果需要自动执行，则auto记忆着最后一次回调的参数（最后一次fire的参数），这是一个很诡异的且奇葩的用法
        //这个变量用法很诡异和犀利，既包含了是否指定执行的标志，又记录了数据
            stack = option.once && [],     //一个callbacks栈，如果当前正在执行回调数组，而在执行中又新添了回调函数，那么把新的回调函数，那么新的回调函数都会压入该栈
            firing = false, //callbacks是否正在工作/执行
        //触发回调函数
            fire = function (data) {
                //注意这个data是个数组
                memory = option.auto && data; //在这里，如果配置要求记忆最后的参数，则记忆这个参数
                fired = true;
                firingIndex = firingStart || 0;     //是否有自动执行的标识
                firing = true; //正在执行回调函数
                for (; firingIndex < firingLength; firingIndex++) {
                    if (list[firingIndex].apply(data[0], data[1]) === false) break; //当函数返回false，终止执行后续队列
                }
                firing = false; //停止执行回调函数
                if (stack && stack.length) //如果存在栈，则执行
                    fire(stack.shift()); //从栈头部取出，并递归fire()方法
            };
        var self = {
            add: function () {//添加一个回调函数
                if (list) {
                    var start = list.length;
                    (function addCallback(args) {
                        each(args, function (item) {
                            if (isFunction(item)) {//是函数，则压入回调列表
                                list.push(item);
                            } else if (typeof item === '[object Array]') {//如果是个数组，则递归压入回调列表，这个判定抛弃了array-like
                                addCallback(item);
                            }
                        });
                    })(arguments);
                }
                if (firing)//如果当前正有回调函数在执行，那么需要更新当前回调函数列表的length，否则这个新压入的回调函数就会被掠过。
                    firingLength = list.length;
                else if (auto) {//如果当前没有执行回调函数，并且要求自动执行
                    //注意这里是给firingStart赋值，上面fire方法中正在使用的是firingIndex，这里不会影响到上面代码的执行线路
                    firingStart = start;
                    fire(this);
                }
                return this;
            },
            fire: function () {//触发回调函数
                self.fireWith(this, arguments);
                return this;
            },
            fireWith: function (context, args) {//触发回调函数，并指定上下文
                if (list) {
                    //修正参数
                    //在这里,context索引为0
                    //而参数列表索引为2
                    //转换为数组访问是因为对象表示更加的消耗资源，在顶层的fire()代码中有memory[记忆参数]这个功能，如果采用对象则开销了更大的内存
                    args = [context, args ? args.slice && args.slice() : args || []];
                    fire(args);
                }
                return this;
            },
            remove: function () {//移除一个回调函数
                if (list) {
                    each(arguments, function (item) {
                        var index;
                        //可能有多项，index可以在循环中表示检索的范围，之前检索的过的可以不用再检索
                        while ((index = inArray(item, list, index)) > -1) {
                            list.splice(index, 1);
                            if (firing) {
                                if (index <= firingLength)//修正长度
                                    firingLength--;
                                if (index <= firingLength)//修正索引
                                    firingIndex--;
                            }
                        }
                    });
                }
                return this;
            },
            has: function (fn) {//是否包含一个回调函数
                return fn ? inArray(fn, list) > -1 : list && list.length;
            },
            empty: function () {//清空这个callbacks对象
                list = [];
                firingLength = 0;
                return this;
            },
            disable: function () {//废掉这个callbacks对象，后续的回调函数列表不再执行
                list = stack = auto = undefined;
                return this;
            },
            disabled: function () {//是否已经废掉
                return !!list; //转换为boolean
            },
            lock: function (isLock) {//锁定或解锁这个callbacks对象
                if (isLock) {//锁
                    _list = stack && list.concat(stack) || list;
                    list = undefined;
                } else {//解锁
                    list = _list;
                    _list = undefined;
                }
                return this;
            },
            locked: function () {//判断这个callbacks是否被锁定
                return !!_list;
            },
            fired: function () {//这个callbacks是否执行过
                //转换为boolean，包括undefined，null,''等
                return !!fired;
            }
        };
        return self;
    };
    window.$ = window.$ || {};
    window.$ = window.callbacks = window.$.callbacks = callbacks;
} (window));