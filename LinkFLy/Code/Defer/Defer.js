; (function (window, undefined) {

    var toString = Object.prototype.toString,
		each = Array.prototype.forEach,
        slice = Array.prototype.slice,
        splice = Array.prototype.splice,
        push = Array.prototype.push,
        isFunction = function (obj) {
            return toString.call(obj) === "[object Function]";
        },
        isOver = function (state) {//defer对象是否已经完成状态
            return state !== globalState.PENDING;
        },
        fire = function (callbacks, datas) {//执行一组函数，并允许追加数据
            if (!callbacks || !callbacks.length) return;
            for (var i = 0, len = callbacks.length; i < len; i++) {
                datas ? callbacks[i].apply(datas) : callbacks[i];//设计不正确，每个函数的返回值都应该追加到数组中
            }
        },
        checkState = function () {

        },
        globalState = {
            //3个状态是不够的，一共有5个状态：成功，失败，成功等待中，失败等待中
            PENDING: 0,
            RESOLVED: 1,
            REJECTED: 2,
            RESOLVEWAIT: 3,
            REJECTWAIT: 4
        };
    //只有一个要求！！！轻！！！
    var Defer = function (callback) {
        //要兼容jQuery的ajax语法....

        //Publish/Subscribe模式实现
        var callbacks = [[], [], []],//done/fail/progress
            state = globalState.PENDING;
        var defer = {
            state: function () {
                return state;
            },
            then: function (done, fail) {
                return Defer(function (newDefer) {
                    //子链只会有一个父链，只会订阅一个父链
                    newDefer.parent = defer;
                });
            },
            done: function () {
                if (state === globalState.RESOLVED) {
                    fire(arguments);
                } else
                    each.call(arguments, function (fn) {
                        if (isFunction(fn))
                            callbacks[0].push(fn);
                    });
                return this;
            },
            fial: function () {
                return this;
            },
            aways: function (resolve, reject) {
                return defer.done(resolve).fail(reject);
            },
            resolve: function () {
                //执行时机要判断父链和子链是否完成
                //如果有父链，则订阅父链的信息
                if (defer.parent == null || isOver(defer.parent.state())) {
                    state = globalState.RESOLVED;
                    fire(callbacks[0], arguments);
                } else {
                    //给父链发消息通知它已经完成了
                    state = globalState.RESOLVEWAIT;
                    defer.parent.aways(function () {
                        defer.resolve();
                    });
                }
            },
            reject: function () {

            }
        };
        return defer;
    };
    window.Defer = Defer;
})(window);


(function (window) {
    var Defer = window.Defer,
        defer = new Defer();
    var defer1 = defer.then(function () {

    }, function () {

    });
    var defer2 = defer1.then(function () {

    }, function () {

    });

    defer2.resolve();
    defer1.resolve();//由defer.then()派生的Defer对象，只有在上一层得到结果状态后才会执行下一层状态
}(window));
