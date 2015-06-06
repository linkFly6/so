; (function (window, undefined) {
    'use strict';
    var toString = Object.prototype.toString,
    each = Array.prototype.forEach,
    slice = Array.prototype.slice,
    splice = Array.prototype.splice,
    push = Array.prototype.push,
    flagId = 46840404742,
    isFunction = function (obj) {
        return toString.call(obj) === "[object Function]";
    },
    isArray = Array.isArray || function (arg) {
        return toString.call(arg) === '[object Array]';
    },
    isArrayLike = function (obj) {
        if (obj == null) return false;
        var length = obj.length, t = toString.call(obj);
        return t == '[object Array]' || !isFunction(obj) &&
                t !== '[object String]' &&
                (+length === length &&
                !(length % 1) &&
                (length - 1) in obj);
    },
    map = function () {
        var res = [];
        each.call(arguments, function (arg) {
            if (isArray(arg))
                res.concat(arg);
            else if (isArrayLike(arg))
                each.call(arg, function (tmp) {
                    res.push(tmp);
                });
            else
                res.push(arg);
        });
        return res;
    },
    isOver = function (state) {//defer对象是否已经完成状态
        return state !== globalState.PENDING;
    },
    trigger = function (self, callbacks, datas) {//执行一组函数，并允许追加数据
        if (!callbacks || !callbacks.length) return;
        var fn, value;
        while (callbacks.length) {
            fn = callbacks.shift();
            if (isFunction(fn))
                value = datas ? fn.apply(self, datas) : fn();//TODO 这个返回值应该和Promise/A+规范一样，一直往后传递
        }
        return value;
    },
    extend = function (target, source) {
        for (var name in source)
            target[name] = source[name];
        return target;
    },
    globalState = {
        //5个状态：成功，失败，成功等待中，失败等待中
        PENDING: 6,
        RESOLVED: 0,
        REJECTED: 1,
        ERROR: 2
    };
    var deferTemplent = [
        ['done', 'resolve', globalState.RESOLVED, globalState.RESOLVEWAIT],
        ['fail', 'reject', globalState.REJECTED, globalState.REJECTWAIT]
    ],

        Defer = function (callback) {
            if (!(this instanceof Defer)) return new Defer(callback);
            this.callbacks = [[], []];
            this._state = globalState.PENDING;
            var _self = this, res;
            if (isFunction(callback)) {
                res = callback.call(_self, function () {
                    _self._state = globalState.RESOLVED;
                    _self._fire(arguments);
                }, function () {
                    _self._state = globalState.REJECTED;
                    _self._fire(arguments);
                });
                if (Defer.isDefer(res)) {

                }
            }
            if (Defer.isDefer(callback)) return callback;
        };

    Defer.isDefer = function (obj) {
        return obj && obj._id === flagId;
    };
    Defer.prototype._id = flagId;
    Defer.prototype._post = function (index, callbacks) {
        var cache = this.callbacks[index];
        cache && each.call(isArrayLike(callbacks) ? callbacks : [callbacks], function (callback) {
            if (isFunction(callback))
                cache.push(callback);
        });
        return index === this._state ?
            this._fire(this.data) :
            this;
    };

    //fire方法转移到_fire
    var fire = function (context, fns, data) {
        var callback;
        while ((callback = fns.shift())) {
            data = callback.apply(context, data);
            if (Defer.isDefer(data))
                data._post(data)
        }
    }

    Defer.prototype._fire = function (data) {
        var cache = this.callbacks[this._state], callback;
        this.data = data;
        if (!cache) return this;
        try {
            while ((callback = cache.shift())) {
                data = callback.apply(this, data);
                if (Defer.isDefer(data)) {
                    data._post(globalState.RESOLVED, cache);
                    data._post(globalState.REJECTED, cache);
                    //data.catch(function () {

                    //});
                    return data;
                }
            }
            //return fire(this, cache, this.data = datas);
        } catch (e) {
            var res = e;
            if (this.callbacks[2])
                this.callbacks[2].forEach(function (errorCallback) {
                    try {
                        res = errorCallback(res);
                    } catch (e) {
                        res = e;
                    }
                });
        }
        return this;
    };

    Defer.prototype.catch = function () {
        return this._post(2, arguments);
    };


    Defer.prototype.then = function (done, fail) {
        var _parent = this,
            deferred = new Defer(function (resolve, reject) {
                this._post(globalState.RESOLVED, done);
                this._post(globalState.REJECTED, fail);
                _parent._post(globalState.RESOLVED, function () {
                    resolve.apply(this, arguments);
                    //return done.apply(this, arguments);
                })
                    ._post(globalState.REJECTED, function () {
                        reject.apply(this, arguments);
                        //return fail.apply(this, arguments);
                    })
                    .catch(function (error) {
                        deferred.catch(function (e) {
                            return e || error;
                        });
                        return error;
                    });
            });
        return deferred;
    };


    Defer.prototype.all = function () {

    };
    window.Defer = Defer;
})(window);

