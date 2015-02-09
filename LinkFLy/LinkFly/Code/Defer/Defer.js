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
            return state === 'rejected' && state === 'resolved';
        },
        fire = function (callbacks, datas) {//执行一组函数，并允许追加数据
            if (!callbacks || !callbacks.length) return;
            for (var i = 0, len = callbacks.length; i < len; i++) {
                datas ? callbacks[i].apply(datas) : callbacks[i];//设计不正确，每个函数的返回值都应该追加到数组中
            }
        };
    var Defer = function (callback) {
        //3个状态是不够的，一共有5个状态：成功，失败，成功等待中，失败等待中
        //Publish/Subscribe模式实现
        var callbacks = [[], [], []],//done/fail/aways
            state = 'pending',
            pubDefers = [];//发布模式
        var defer = {
            _childReady: function () {

            },
            _parentReady: function () {

            },
            state: function () {
                return state;
            },
            then: function (done, fail) {
                return Defer(function (newDefer) {
                    //子链只会有一个父链，只会订阅一个父链
                    newDefer.parent = defer;
                    //子链和父链别应该通过事件订阅模式完成，子链可以访问父链
                    pubDefers.push(newDefer);
                });
            },
            aways: function () {

            },
            resolve: function () {
                //执行时机要判断父链和子链是否完成
                state = 'resolved';
                //如果有父链，则订阅父链的信息
                if (defer.parent == null || isOver(defer.parent.state())) {
                    fire(callbacks[0], arguments);
                } else {
                    //给父链发消息通知它已经完成了

                }
            },
            reject: function () {

            }

        };
    };

    Defer.prototype.then = function (done, fail) {
        return Defer(function () {

        }, function () {

        });
    };
    Defer.prototype.resolve = function () {

        return this;
    };
    Defer.prototype.reject = function () {

        return this;
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
