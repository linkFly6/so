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
                WAITING: 1,
                END: 2
            };
        //单向阻塞链
        var id = +new Date,
            CallBacks = function () { };
        CallBacks.prototype.guid = 0;
        CallBacks.prototype.callbacks = [];
        CallBacks.prototype.add = function (callback) {//添加一组回调函数
            this.callbacks.push(callback);
            callback[id] = this.guid++;
            return callback[id];
        };
        CallBacks.prototype.done = function (id) {//执行一个id下的回调函数，该函数将查询上一个函数的状态

        };

        var Defer = function (url, done) {
            if (!(this instanceof Defer))
                return new Defer(url, done);
            this.load(url, done);
        },
        State = function (state, callback) {
            if (!(this instanceof State))
                return new State(state, callback);
            this.state = state || globalState.WAIT;
            this.callback = callback;
        };
        Defer.prototype.state = globalState.WAIT;
        Defer.prototype.data = null;
        Defer.time = 1000;//默认超时时间
        Defer.prototype.load = function (url, done, fail, time) {
            var timeoutHandle, time, defer = this, newCallback, trigger, state;
            if (url == null || typeof url !== 'string' || !isFunction(done)) return this;
            if (fail > 0) {
                time = fail;
                fail = null;
            }
            time = time || Defer.time;
            trigger = function (state, data) {
                defer.data = defer.prev(state, data);
            }
            state = State();
            if (defer.prev) {
                newCallback = defer.prev;
                defer.prev = function (state, data) {
                    //console.log('这里');
                    if (state.state === globalState.WAITING) {
                        if (newCallback.call(defer, defer.data)) {
                            defer.data = state.callback.call(defer, map(data, defer.data));
                            state.state = globalState.END;
                            //defer.prev = null;
                        }
                    }
                }
            } else {
                defer.prev = function (sate, data) {
                    //console.log('这里?');
                    if (state.state === globalState.END) return true;
                    if (state.state === globalState.WAITING) {
                        defer.data = map(state.callback.call(defer, data));
                        state.state = globalState.END;
                        return true;
                    }
                    return false;
                };
            }
            writeJSONP(url, function (data) {
                clearTimeout(timeoutHandle);
                state.state = globalState.WAITING;
                state.callback = done;
                trigger(state, data);
            });
            timeoutHandle = setTimeout(function () {
                clearTimeout(timeoutHandle);
                if (defer.state) return;
                state.state = globalState.WAITING;
                state.callback = fail;
                trigger(state);
            }, time);
            return this;
        };
        return Defer;
    }();
    window.DeferJsonp = DeferJsonp;

})(window);