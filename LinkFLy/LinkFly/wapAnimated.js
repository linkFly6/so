; (function (window, undefined) {
    var
        document = window.document,
        Slice = Array.prototype.slice,
        String = Object.prototype.toString,
        Trim = ''.trim,
        direction = ['top', 'left', 'buttom', 'right']
    templent = {
        trun3D: false,//3D模型
        time: 0.6,
        slide: 0,//滑动模型，0123对应上下左右
        active: 0
    },
    camelCase = function (str) {
        //转换字符串为驼峰命名
        return str.replace(/_./g, function (word) {
            return word.length ? word.substring(1, 1).toUpCase() : '';
        });
    },
    extend = function () {
        //浅合并一个对象
        var target = arguments[0],
            source = arguments[1] || {},
            name;
        //因为只限内部使用，代码允许松散
        for (name in source) {
            target[name] = source[name];
        }
    },
    css = function (elem, name, value) {
        //设置和获取css方法
        if (typeof (css) === 'object') {
            for (var key in css) {
                //这里没有加上相应的前缀
                //如果要实现的话，可以通过侦测浏览器特性来预编译前缀
                elem.style[camelCase(String.call(key))] = css[key];
            }
        } else if (typeof (name) === 'string' && typeof (value) === 'string')
            elem.style[camelCase[name]] = value;
        else {
            var style = elem.style[camelCase[String.call(name)]];
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
    width = function (elem, isRestore) {
        //这里不该对原节点操作，应该是clone操作
        var result = [{
            visibility: css(elem, 'visibility'),
            position: css(elem, 'position'),
            left: css(elem, 'left'),
            width: css(elem, 'width')
        }];
        css(elem, { 'visibility': 'hidden', 'position': 'absolute', 'left': '0px' });
        //浏览器对小数的操作十分消耗内存
        result.push(parseInt(elem.clientWidth));
        if (isRestore) {
            css(elem, result);
        };
        return result
    },
    animate = function (elems, option) {
        elems = typeof (elems) === 'string' ? find(elems) : Slice.call(elems);
        option = extend(templent, option);
        templent.msTime = templent.time / 1000;
        //这种方式创建的对象无法用instanceOf侦测类型
        var status = {},
            oldStatus = {},
            getStatus = function (name) {
                status = !status[name];
                return !status;
            },
            active = elems[option.active] || {},//当前激活的对象
            parentNode = active && active.parentNode || {},
            self = {
                each: function (fn) {
                    if (!arguments.length || !isFunction(fn)) return self;
                    var item, i = -1;
                    while ((item = elems.shift())) {
                        if (fn.call(item, item, ++i) === false) return self;
                    }
                    return self;
                },
                animate: function (fn) {
                    if (isFunction(fn))
                        fn.call(active, active, option.active, status, elems);
                    return self;
                },
                souce: function () {
                    return elems;
                },
                X: function (value, fn) {
                    //X旋转
                    value = value || -360;
                    if (getStatus('X')) {
                        css(active, 'transform', 'rotate(' + value + 'deg)');
                    } else {
                        css(active, 'transform');
                    }
                    if (fn && isFunction(fn))
                        //并不推荐这么做
                        setTimeout(function () {
                            fn.call(active, active, active[++option.active], elems);
                        }, option.msTime);
                    return self;
                },
                grad: function () {
                    //渐变
                    if (getStatus('opacity')) {
                        css(active, 'opacity', '0');
                        setTimeout(function () {
                            css(active, 'display', 'none');
                        }, option.msTime);
                    } else
                        css(active, { 'display': '', 'opacity': '1' });
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
            var maxWdith = width(parentNode, true),
                radix = width(active),
                pos = 0,
            direc = direction[option.slide] || 'left';
            oldStatus['parent'] = maxWdith[0];
            css(parentNode, { 'transition': 'all ' + option.time + 's ease-in-out 0s', 'visibilidy': oldStatus['parent'].visibility, width: maxWdith[1] + 'px' });
            maxWdith = -maxWdith[1];
            self.slide = function (value) {
                radix = value || radix;
                pos += (-radix);
                if (pos > maxWdith)
                    css(parentNode, direc, pos + 'px');
                else
                    css(parentNode, direc, '0px');
                return self;
            };
        } else {
            self.each(function (item) {
                css(item, 'transition', 'all ' + option.time + 's ease-in-out 0s');
            });
        }
        return self;
    };
}(window));