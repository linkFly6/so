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
            jsonpID = new Date().getTime(),
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
            guid = 0,
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
            },
            globalState = {
                WAIT: 0,
                DONE: 1,
                FAIL: 2
            },
            Defer = function (url, done) {
                if (!(this instanceof Defer))
                    return new Defer(url, done);
                this.guid = guid++;
                this.load(url, done);
            };
        Defer.prototype.state = globalState.WAIT;
        Defer.prototype.data = null;
        Defer.prototype.callback = null;//下一层链的注入
        Defer.time = 1000;//默认超时时间
        Defer.prototype.load = function (url, done, fail, time) {
            var timeoutHandle, time, defer = this, nextDefer, trigger;
            if (url == null || typeof url !== 'string' || !isFunction(done)) return this;

            if (fail > 0) {
                time = fail;
                fail = null;
            }
            time = time || Defer.time;
            trigger = function (callback, data) {
                if (isFunction(defer._prev)) {//看是否被注入了函数
                    defer._prev(callback, data);//执行注入函数
                } else if (isFunction(callback)) {
                    defer.data = callback.call(defer, data);
                    if (defer.callback) {
                        defer.callback(defer.data);
                    }
                }
            };
            defer.url = url;
            writeJSONP(url, function (data) {
                clearTimeout(timeoutHandle);
                defer.state = globalState.DONE;
                trigger(done, data);
            });
            timeoutHandle = setTimeout(function () {
                clearTimeout(timeoutHandle);
                if (defer.state) return;
                defer.state = globalState.FAIL;
                trigger(fail, map(defer.data, undefined));
            }, time);
            nextDefer = new Defer;
            nextDefer.fuck = defer;
            nextDefer._prev = function (callback, data) {//为下一个defer对象注入函数
                //console.log(defer.url, defer.guid, defer.status.state);
                if (defer.state)
                    isFunction(callback) ?
                        callback.apply(defer, nextDefer.data = map(data, nextDefer.data)) :
                        (nextDefer.data = data);
                else {
                    defer.callback = callback;
                    defer.data = data == null ? data : map(data);
                }
            };
            return nextDefer;
        };
        return Defer;
    }();
    window.DeferJsonp = DeferJsonp;

})(window);