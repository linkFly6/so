/*!
* Copyright 2015 linkFLy - http://www.cnblogs.com/silin6/
* Released under the MIT license
* http://opensource.org/licenses/mit-license.php
* Help document：https://github.com/linkFly6/linkfly.so/blob/master/LinkFLy/Code/deferJsonp
* Date: 2015-06-05 00:12:25
*/
; (function (window) {
    var DeferJsonp = function () {
        var domHead = document.getElementsByTagName('head')[0],
            undefined = void 0,
            writeJSONP = function (url, callback) {
                var node = document.createElement('script'),
                    callbackName = regGetCallbackName.test(url) ?
                          url.match(regGetCallbackName)[1] : 'djsonp' + jsonpID++,
                    match;
                window[callbackName] = callback;
                node.type = "text/javascript";
                node.charset = "utf-8";
                node.src = url.replace(regCallbackName, '?$1=' + callbackName);
                domHead.appendChild(node);
            },
            regGetCallbackName = /callback=([^&\b?]+)/,
            regCallbackName = /\?(.+)=\?/,
            jsonpID = +new Date,
            slice = Array.prototype.slice,
            each = Array.prototype.forEach,
            isArray = Array.isArray,
            toString = Object.prototype.toString,
            isFunction = function (obj) {
                return toString.call(obj) === '[object Function]';
            },
            isArrayLike = function (obj) {
                if (obj == null) return false;
                var length = obj.length;
                return isArray(obj) || !isFunction(obj) &&
                typeof obj !== 'string' &&
                (+length === length && //正数
                !(length % 1) && //整数
                (length - 1) in obj); //可以被索引
            },
            map = function () {
                var res = [];
                each.call(arguments, function (arg) {
                    if (isArray(arg))
                        res = res.concat(arg);
                    else if (isArrayLike(arg))
                        each.call(arg, function (tmp) {
                            res.push(tmp);
                        });
                    else
                        res.push(arg);
                });
                return res;
            };
        //Callbacks才是把控顺序执行链的主要对象
        var key = 'defer' + +(new Date),
            CallBacks = function () {
                if (!(this instanceof CallBacks))
                    return new CallBacks();
            };
        CallBacks.prototype.guid = 0;
        CallBacks.prototype.callbacks = [];
        CallBacks.prototype.data = [];
        CallBacks.prototype.lock = false;
        CallBacks.prototype.waits = [];
        CallBacks.prototype.add = function (callback) {//添加一组回调函数
            this.callbacks.push(callback);
            callback[key] = this.guid++;//标识ID
            return callback[key];
        };
        CallBacks.prototype.done = function (id) {//执行一个id下的回调函数，该函数将查询上一个函数的状态
            var callback,
                _id,
                flag = false,
                i = 0;
            //防止event loop冲突
            if (this.lock) {
                this.waits.push(id);
                return this;
            };
            this.lock = true;//锁定操作
            while ((callback = this.callbacks[i++])) {
                _id = callback[key];//获取当前函数的id
                if (_id !== -1 && _id !== id) {
                    flag = true;//标识这个函数之前是否有任务尚未完成
                    continue;
                };
                if (_id === id && flag) {
                    callback[key] = -1;//有任务尚未完成，等待
                    break;
                } else if (!flag) {
                    this.data = map(callback.apply(null, this.data), this.data);//可以运行当前函数
                    this.callbacks.shift();//重复运行
                    i = 0;//状态清零，永远从索引0开始
                }
            }
            //处理event loop，动态获取length
            if (this.waits.length) {
                this.done(this.waits.shift());//任务队列还有任务，继续执行
            }
            this.lock = false;//解锁
            return this;
        };

        var Defer = function (url, done) {
            if (!(this instanceof Defer))
                return new Defer(url, done);
            this.load(url, done);
        };
        Defer.prototype.Callbacks = new CallBacks;

        Defer.time = 10e3;//默认超时时间

        Defer.prototype.load = function (url, done, fail, time) {
            var timeoutHandle, time, defer = this, id, _data, isDone = false;
            if (url == null || typeof url !== 'string' || !isFunction(done)) return this;
            if (fail > 0) {
                time = fail;
                fail = null;
            }
            time = time || Defer.time;
            id = defer.Callbacks.add(function () {
                return isDone ? done.apply(defer, map(_data, arguments)) : isFunction(fail) ? fail.apply(defer, map(_data, arguments)) : undefined;
            });
            writeJSONP(url, function (data) {
                isDone = true;
                clearTimeout(timeoutHandle);
                _data = data;
                defer.Callbacks.done(id);
            });
            timeoutHandle = setTimeout(function () {
                clearTimeout(timeoutHandle);
                if (isDone) return;
                defer.Callbacks.done(id);
            }, time);
            return this;
        };
        return Defer;
    }();
    window.deferJsonp = DeferJsonp;

})(window);