/*!
* Copyright 2015 linkFLy - http://www.cnblogs.com/silin6/
* Released under the MIT license
* http://opensource.org/licenses/mit-license.php
* Help document：https://github.com/linkFly6/linkfly.so/blob/master/LinkFLy/Code/DeferJsonp
* Date: 2015-06-05 00:12:20
*/
; (function (window) {
    var DeferJsonp = function (fn) {
        var writeJSONP = function (url, callback) {
            var node = document.createElement('script'),
                callbackName = regGetCallbackName.test(url) ?
                      url.match(regGetCallbackName)[1] : 'djsonp' + jsonpID++,
                match;
            window[callbackName] = callback;
            node.type = "text/javascript";
            node.charset = "utf-8";
            node.src = url.replace(regCallbackName, '?$1=' + callbackName);
            document.getElementsByTagName('head')[0].appendChild(node);
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
        };
        return function () {
            var state = 'pending',
            callbacks = [],
            currIndex = 0,
            load = function (timeout) {
                if (state === 'loading') return defer;
                var tiktok = 0,
                    timeOutHandle;
                !function loadJsonp(data) {
                    if (callbacks.length) {
                        var fns = callbacks.shift(),
                            url = fns[0],
                            done = fns[1],
                            fail = fns[2],
                            timeOutHandle, loadState = 0;
                        state = 'loading';
                        writeJSONP(url, function () {
                            if (loadState === 2) return;
                            loadState = 1;
                            clearTimeout(timeOutHandle);
                            loadJsonp(done.apply(defer, map(arguments, data)));//进行下一次加载，并把上一次的返回结果补给下一个函数
                        });
                        timeOutHandle = setTimeout(function () {
                            clearTimeout(timeOutHandle);
                            if (loadState === 1) return;
                            loadState = 2;
                            loadJsonp(isFunction(fail) ? fail.call(defer, data) : undefined);
                        }, timeout);
                    } else
                        state = 'pending';
                }();
                return defer;
            },
            defer = {
                constructor: DeferJsonp,
                /**
                 * @description 发起jsonp请求，构建一个新的jsonp对话到执行队列中，并执行这个队列
                 * @param {String} url 请求的url
                 * @param {Function} done 成功后执行的函数
                 * @param {Function} fail 失败后执行的函数
                 * @return {DeferJsonp} result 返回DeferJsonp对象
                 */
                load: function (url, done, fail) {
                    while (url != null && typeof url === 'string') {
                        var fns = [];//[url,done,fail]
                        if (isFunction(done))
                            fns.push(url, done);
                        else break;
                        if (isFunction(fail))
                            fns.push(fail);
                        callbacks.push(fns);
                        break;
                    }
                    return load(DeferJsonp.time || 2000);
                }
            };
            if (isFunction(fn))
                fn(defer, state, callbacks);
            return defer;
        }
    }();
    DeferJsonp.time = 2000;
    window.DeferJsonp = DeferJsonp;
})(window);