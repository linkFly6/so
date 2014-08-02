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
            var list = toSlice.call(arguments[0]),
                fn = arguments[1],
                item;
            while ((item = list.shift())) {//没有直接判定length，加速
                // 为什么这里用call就可以，而apply就不行？
                //搞定 - apply的第二个参数必须是一个array对象（没有验证array-like是否可以，而call没有这个要求）
                //apply是这样描述的：如果 argArray（第二个参数） 不是一个有效的数组或者不是 arguments 对象，那么将导致一个 TypeError。 
                fn.call(window, item);
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
        }();

    var Callbacks = function (option) {
        option = toString.call(option) === '[object Object]' ? option : {};
        //使用闭包，因为每个新建的callbacks都有自己的状态
        var list = [],      //回调列表
            _list = [],     //如果锁定这个callbacks对象，则清空list，将原list置入_list
            fired,          //是否执行过
            firingStart,    //当前回调函数列表执行的函数索引（起点）
            firingLength,   //回调函数的数组长度
            auto,   //标志是否自动执行，如果需要自动执行，则auto记忆着最后一次回调的参数（最后一次fire的参数），这是一个很诡异的且奇葩的用法
            //这个变量用法很诡异和犀利，既包含了是否指定执行的标志，又记录了数据
            //这个auto配合once简直就是丧心病狂：【第一次】执行了fire后才会自动执行，配合once可以做到：一次执行，后面不再追加和执行代码，保证了一组回调数据的稳定和安全
            stack = !option.once && [],     //一个callbacks栈，如果当前正在执行回调数组，而在执行中又新添了回调函数，那么把新的回调函数，那么新的回调函数都会压入该栈
            firing = false, //callbacks是否正在工作/执行
        //触发回调函数
            fire = function (data) {
                //注意这个data是个数组，如果配置了auto模式，那么auto永远不会为false，因为auto会是个数组
                auto = option.auto && data; //在这里，如果配置要求记忆最后的参数，则记忆这个参数（非常犀利的用法，直接取了数据）
                fired = true;
                firingIndex = firingStart || 0;
                firingStart = 0;//清空firingStart（不清空下次执行有出问题啦）
                firingLength = list.length;         //缓存list长度，外界可以访问
                firing = true; //正在执行回调函数
                for (; firingIndex < firingLength; firingIndex++) {
                    if (list[firingIndex].apply(data[0], data[1]) === false) {
                        //注意，如果配置了option.auto（自动执行），并且stack（栈）里存在函数，那么add()代码里有一段对于auto判定会直接执行本方法的代码
                        //我们要阻止掉那段代码，所以设置auto为false
                        auto = false;
                        break;
                    }//当函数返回false，终止执行后续队列
                }
                firing = false; //标志状态已经执行完毕回调函数[stack(栈)里面的函数尚未执行]
                //如果这个栈在没有配置once的情况下肯定是[]，所以一定存在
                //这里主要作用是，如果没有配置once，则拦截下面的代码，如果配置了once，执行完代码清空数据
                if (stack) {
                    if (stack.length)//先把下面清空list状态的代码拦截掉，再判定是否有栈
                        fire(stack.shift()); //从栈头部取出，并递归fire()方法
                }
                else if (auto)    //代码走到这里，证明已经配置了option.once（只执行一次），于是把list清空
                    list = [];
                else                //证明没有配置auto，但是配置了once，那么祭出终极大法，直接废了这个callbacks对象
                    self.disable();
            };
        var self = {
            add: function () {//添加一个回调函数
                if (list) {
                    var start = list.length;
                    (function addCallback(args) {
                        each(args, function (item) {
                            if (isFunction(item)) {//是函数，则压入回调列表
                                list.push(item);
                                //注意typeof 和Object.prototype.toString是不一样的
                            } else if (toString.call(item) === '[object Array]') {//如果是个数组，则递归压入回调列表，这个判定抛弃了array-like
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
                    //执行我们新加入的小伙伴
                    fire(auto);
                }
                return this;
            },
            fire: function () {//触发回调函数
                self.fireWith(this, arguments);
                return this;
            },
            fireWith: function (context, args) {//触发回调函数，并指定上下文
                //如果配置了once，stack将为undefined，而once又需要保证只执行一次，所以一旦执行过一次，这里的代码不会再执行
                if (list && (!fired || stack)) {
                    //修正参数
                    //在这里,context索引为0
                    //而参数列表索引为2
                    //转换为数组访问是因为对象表示更加的消耗资源，在顶层的fire()代码中有auto[记忆参数，自动执行]这个功能，如果采用对象则开销了更大的内存
                    args = [context,
                        args ?
                        args.slice && args.slice()
                        || toSlice.call(args) :
                        []
                    ];
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
                                //保证上面fire中正在执行的函数列表能够正确运行，fire中设定全局这些变量为的就是这里可以异步移除
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
                return !list; //转换为boolean
            },
            lock: function (isLock) {//锁定或解锁这个callbacks对象
                //无参，判断这个callbacks是否被锁定
                if (isLock == null) return !!_list;
                if (isLock) {//锁
                    _list = stack && list.concat(stack) || list;
                    list = undefined;
                } else {//解锁，jQuery并没有提供解锁功能，解锁让Callbacks变得不稳定
                    list = _list;
                    _list = undefined;
                }
                return this;
            },
            fired: function () {//这个callbacks是否执行过
                //转换为boolean，包括undefined，null,''等
                return !!fired;
            }
        };
        return self;
    };
    window.$ = window.$ || {};
    window.$.Callbacks = window.Callbacks = Callbacks;
}(window));