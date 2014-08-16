(function (window, undefined) {
    var $ = window.$,
        Slice = toSlice = Array.prototype.slice,
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
        each = function () {
            if (arguments.length < 2 || !isFunction(arguments[1])) return;
            var list = toSlice.call(arguments[0]),
                fn = arguments[1],
                length = list.length,
                i = 0,
                item;
            for (; i < length; i++) {
                fn.call(window, list[i]);
            }
        },
        extend = function () {
            //浅合并一个对象
            var target = arguments[0] || {},
            source = arguments[1] || {},
            name;
            //因为只限内部使用，代码允许松散
            for (name in source) {
                if (!target[name])
                    target[name] = source[name];
            }
            return target;
        },
        deferred = {},
        Deferred = function (fn) {
            //因为Deferred和promise很多地方的通用的
            //于是抽出这些通用部分，然后一起生成
            var tuples = [
            //注意，配置的once和auto映射的Deferred的模型
                ["resolve", "done", $.Callbacks({ once: true, auto: true }), "resolved"],
				["reject", "fail", $.Callbacks({ once: true, auto: true }), "rejected"],
            //因为这里的函数需要重复执行，所以没有once
				["notify", "progress", $.Callbacks({ auto: true })]
            ],
            state = 'pending',
            promise = {
                state: function () {
                    return state;
                },
                promise: function (obj) {
                    //这是有意思的接口
                    //无参的它返回promise自身
                    //有参的它将为这个参数追加上promise行为
                    return obj == null ? extend(obj, promise) : promise;
                },
                always: function (fn) {
                    deferred.done(fn).fail(fn);
                },
                /*
                建议then()留到最后读
                then的原理是通过新建一个deferred对象
                */
                then: function () {
                    var thenArgs = arguments;
                    //这个函数会立即执行
                    return Deferred(function (newDeferred) {
                        each(tuples, function (i, item) {
                            //这个deferred是顶层的Deferred对象
                            //获取对应的参数
                            var fn = isFunction(thenArgs[i]) && thenArgs[i];
                            //这里调用的是[ done | fail | progress]
                            //也就是对应Callbacks.add
                            //本质上，在顶层的deferred中追加了一个匿名函数，这个函数将then传递的函数进行封装
                            deferred[item[1]](function () {
                                var value = fn && fn.apply(this, arguments);
                                //jQuery有对这个value的promise行为做判定，测试发现这个行为有点鸡肋，于是给干掉了

                                //这才是关键，如果有上一层的返回值，则把这个返回值传递到下一层

                                //jQuery里判定this === promise ? newDefer.promise() : this
                                //这里的判定是什么意思呢？？
                                newDeferred[item[0] + 'with'](this, fn ? [value] : arguments);
                                //newDeferred是这个闭包里生成的deferred
                            });
                            fn = null;
                        });
                        //注意这个newDeferred的概念
                        //then()追加函数到了上一层，这里有两个上一层：
                        //1、deferred.then().then() - 这里第二个then()的上一层是第一个then()里面的deferred
                        //2、deferred.then();Deferred.then() - 这里的两个then()的上一层都是deferred，他们俩是平级的

                        //最后执行的newDeferred[doneWith]，就是执行下一层的函数，并把这一层函数的返回值传递到下一层
                        //所以在上下文里，判定了this === promise ? newDeferred.promise() : this

                        //你可以试试第2种方式来追加，应该两个then无法通信

                    }).promise();
                }
            };
            //生成公共部分
            each(tuples, function (i, item) {
                var callbacks = item[2], //callbacks
                /* "resolved"||"rejected"||undefined */
                    stateString = item[3];
                /* done||fail||progress === callbacks.add */
                promise[item[1]] = callbacks.add; //注意callbacks里面最终返回值是this，巧妙的编码
                if (stateString) { //能够进入这里的只有i===0||i===1
                    //有状态则将相应的回调函数添加到callbacks中
                    //注意这里添加了三个
                    callbacks.add(function () {
                        state = stateString;
                    },
                    item[i ^ 1].disable,
                    function () {
                        item[2][2].lock(true);
                    });
                    //到了这里，回调函数都已经准备好了
                }
                /* resolveWith||rejectWith||notifyWith*/
                deferred[item[0] + 'With'] = callbacks.fireWidth;
                /* resolve||reject||notify*/
                deferred[item[0]] = function () {
                    //jQuery在第一个参数这里使用了：this === deferred ? promise
                    deferred[item[0] + 'With'](promise, arguments);
                    return this;
                };
            });
            //上面方法执行之后
            //deferred还差done，fail，progress，state,promise，always，then没有生成
            //使用promise.promise生成
            promise.promise(deferred);
            if (fn) {
                //如果new Deferred()有参数，那么立即执行它，同时把闭包里deferred对象传递给它
                //这个地方提供了第二个环境来访问这个新的Deferred，用于then方法中
                fn.call(deferred, deferred);
            }
            //返回真正的diferred对象
            return deferred;
        };
    window.$.Deferred = Deferred;
})(window);