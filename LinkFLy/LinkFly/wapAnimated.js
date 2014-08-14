(function (window, undefined) {
    var document = window.document,
        Slice = Array.prototype.slice,
        String = Object.prototype.toString,
        Trim = ''.trim,
        direction = ['top', 'left', 'bottom', 'right']
    templent = {
        trun3D: false, //3D模型
        time: 0.6,
        slide: 0, //滑动模型，1234对应上左下右（↑→↓←）
        active: 0
    },
    camelCase = function (str) {
        //转换字符串为驼峰命名
        if (!str || str.indexOf('_') < 0 || str.indexOf('-') < 0) return str;
        return Trim.call(str.replace(/[-_][^-_]/g, function (word) {
            return word.charAt(1).toUpperCase();
        }));
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
    css = function (elem, name, value) {
        if (!elem || elem.nodeType !== 1) return elem;
        //设置和获取css方法
        if (typeof (name) === 'object') {
            for (var key in name) {
                //这里没有加上相应的前缀
                //如果要实现的话，可以通过侦测浏览器特性来预编译前缀
                elem.style[camelCase(key)] = name[key];
            }
        } else if (typeof (name) === 'string' && typeof (value) === 'string')
            elem.style[camelCase(name)] = value;
        else {
            var style = elem.style[camelCase(String.call(name))];
            if (!style) {
                style = window.getComputedStyle(elem, null);
                style = style[name];
            }
            return style;
        }
        return elem;
    },
    find = function (selector) {
        if (!Trim.call(selector)) return [];
        var elems = document.querySelectorAll(selector);
        return elems ? Slice.call(elems) : [];
    },
    isFunction = function (fn) {
        return String.call(fn) === '[object Function]';
    },
    width = function (elem) {
        var result, cloneNode, parentNode = elem.parentNode;
        if ((result = css(elem, 'width')).indexOf('px') !== -1) {
            return parseInt(result);
        }
        cloneNode = elem.cloneNode(true);
        css(cloneNode, { 'visibility': 'hidden', 'position': 'absolute', 'left': '0px' });
        parentNode.appendChild(cloneNode);
        //浏览器对小数的操作十分消耗内存
        result[1] = parseInt(elem.clientWidth);
        parentNode.removeChild(cloneNode);
        return result;
    },
    animate = function (elems, option) {
        elems = typeof (elems) === 'string' ? find(elems) : Slice.call(elems);
        option = extend(option, templent);
        templent.msTime = templent.time * 1000;
        //这种方式创建的对象无法用instanceOf侦测类型
        var status = {},
            oldStatus = {},
            getStatus = function (name) {
                status = !status[name];
                return !status;
            },
            active = elems[option.active] || {}, //当前激活的对象
            parentNode = active && active.parentNode || {},
            self = {
                each: function (fn) {
                    if (!arguments.length || !isFunction(fn)) return self;
                    var item, i = 0, length = elems.length;
                    for (; i < length; i++) {
                        item = elems[i];
                        if (fn.call(item, item, i) === false) return self;
                    }
                    return self;
                },
                animate: function (fn, callbacks) {
                    //第一个函数用于执行到极限后的函数，
                    //第二个函数用于每次动画执行
                    //两个函数互斥
                    if (!callbacks) {
                        callbacks = fn;
                        fn = undefined;
                    }
                    if (isFunction(callbacks)) {
                        if (!active && isFunction(fn)) {
                            fn.call(active = elems[(option.active = 0)], active);
                        } else if (callbacks.call(active, active, option.active, elems) !== false) {
                            active = elems[++option.active];
                        }
                    }
                    return self;
                },
                souce: function () {
                    return elems;
                },
                X: function (value, fn) {
                    //X旋转
                    value = value || -360;
                    self.animate(function (active) {
                        self.each(function (item) {
                            css(item, 'transform', '');
                        });
                    }, function (active) {
                        css(active, 'transform', 'rotate(' + value + 'deg)');
                        if (fn && isFunction(fn)) {
                            //并不推荐这么做
                            setTimeout(function () {
                                //浏览器只有一个线程，阻塞当前线程
                                fn.call(active, active, elems[++option.active], elems);
                                active = elems[++option.active] || elems[(option.active = 0)];
                            }, option.msTime);
                            return false;
                        }
                    });
                    return self;
                },
                grad: function () {
                    //渐变
                    self.animate(function (active, i, elems) {
                        var next = elems[++i];
                        if (!next) {
                            next = elems[0];
                            option.active = -1;
                        }
                        //不能使用
                        css(next, { 'display': '' });
                        css(active, 'opacity', '0');
                        css(next, 'opacity', '1');
                    });
                    return self;
                },
                turn: function (value) {
                    //翻转
                    value = value || 90;
                    self.animate(function (active, i, elems) {
                        var next = elems[++i];
                        if (!next) {
                            next = elems[0];
                            option.active = -1;
                        }
                        css(parentNode, { 'transition': 'all 0.6s ease-in-out 0s', 'transform': 'rotateX(0deg) rotateY(100deg)' });
                        //                        css(next, 'transform', 'rotateY(100deg) translateZ(100px)');
                        //                        css(active, { 'transform': 'rotateY(-90deg) translateZ(100px)' });
                        //                        setTimeout(function () {
                        //                            css(next, 'transform', 'rotateY(0deg)');
                        //                        }, 100);
                    });
                    return self;
                }
            };
        //本想采用预编译，觉得性能有损失，于是采用动态生成
        if (option.trun3D) {
            //3D模式
            self.trun3D = function () {

                return self;
            };
        } else if (option.slide && parentNode && parentNode.nodeType === 1) {
            //滑动模式
            //矫正active
            option.active = 0;
            active = elems[option.active] || {};
            var maxWdith = -width(parentNode),
                radix = width(active),
                pos = 0,
            direc = direction[option.slide] || 'left';
            oldStatus['parent'] = {
                visibility: css(parentNode, 'visibility'),
                position: css(parentNode, 'position'),
                left: css(parentNode, 'left'),
                width: css(parentNode, 'width')
            };
            css(parentNode, { transition: 'all ' + option.time + 's ease-in-out 0s', left: '0px',
                width: maxWdith + 'px',
                position: 'absolute',
                overflow: 'hidden'
            });
            self.slide = function (value) {
                radix = value || radix;
                pos += (-radix);
                if (pos > maxWdith)
                    css(parentNode, direc, pos + 'px');
                else {
                    css(parentNode, direc, '0px');
                    pos = 0;
                }
                return self;
            };
            self.radix = function () {
                return radix;
            };
        }
        self.each(function (item) {
            css(item, 'transition', 'all ' + option.time + 's ease-in-out 0s');
        });
        return self;
    };
    window.so = window.so || {};
    window.so.animate = animate;
} (window));