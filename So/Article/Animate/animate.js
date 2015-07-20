(function (window) {
    var Support = {
        cssPrefix: null,
        eventPrefix: null,
        onTransitionEnd: null
    },
    testElem = document.createElement('div'),
    //transitionProperty、webkitTransitionProperty、MozTransitionDuration、TODO 尚未验证、msTransitionProperty
    vendors = { '': '', 'Webkit': 'webkit', 'Moz': '', 'O': 'o', 'ms': 'ms' },
    /*
        https://github.com/madrobby/zepto/pull/742
        firefox从未支持过mozTransitionEnd或MozTransitionEnd，firefox一直支持标准的事件transitionend
    */
    normalizeEvent = function (name) {
        return Support.eventPrefix ? Support.eventPrefix + name : name.toLowerCase();
    };
    Object.keys(vendors).some(function (name) {
        var eventPrefix = vendors[name];
        //嗅探特性
        if (testElem.style[(name ? name + 'T' : 't') + 'ransitionProperty'] !== undefined) {
            Support.cssPrefix = name ? '-' + name.toLowerCase() + '-' : name;
            Support.eventPrefix = eventPrefix;
            Support.onTransitionEnd = normalizeEvent('TransitionEnd');
            return true;
        }
    })
    //动画结束事件
    var onTransitionEnd = Support.onTransitionEnd !== null ?
        //animationEnd从android 4.1支持
         function (el, callback, time) {
             //支持transition
             var onEndCallbackFn = function (e) {
                 if (typeof e !== 'undefined') {
                     if (e.target !== e.currentTarget) return;//防止冒泡
                 }
                 this.removeEventListener(Support.onTransitionEnd, onEndCallbackFn);
                 callback.call(el);
             };
             el.addEventListener(Support.onTransitionEnd, onEndCallbackFn);
         } : function (el, callback, time) {
             //不支持就使用setTimeout
             setTimeout(function () {
                 callback.call(el);
             }, time);
         };
    if (Support.cssPrefix == null) {
        Support.cssPrefix = '';
        Support.eventPrefix = '';
    }

    //动画
    var animatePrototypes = {
        transitionProperty: Support.cssPrefix + 'transition-property',
        transitionDuration: Support.cssPrefix + 'transition-duration',
        transitionDelay: Support.cssPrefix + 'transition-delay',
        transitionTiming: Support.cssPrefix + 'transition-timing-function'
    };

    /**
    * 动画
    * animate(elem, properties, duration)
    * animate(elem, properties, duration, ease)
    * animate(elem, properties, duration, callback, delay)
    * animate(elem, properties, duration, ease, callback, delay)
    * @param {int} elem - 要执行动画的元素
    * @param {function|string} properties - 动画执行的目标属性，为String则表示是animation-name，为object则是transition-property
    * @param {int} duration - 动画执行时间(ms)
    * @param {string} [ease = linear] - 动画线性
    * @param {function} [callback = null] - 动画执行完成的回调函数
    * @param {int} [delay = 0] - 动画延迟(s)
    * @returns {Service}
    */
    var animate = function (elem, properties, duration, ease, callback, delay) {
        //修正参数支持重载
        if (typeof ease === 'function') {
            //重载
            delay = callback;
            callback = ease;
            ease = null;
        }
        var cssProperties = [],
            cssValues = {},
            transformValues = '',
            eventCallback,
            cssStr = [],
            value;
        Object.keys(properties).forEach(function (name) {
            value = properties[name];
            cssValues[name] = typeof value === 'number' ? value + 'px' : value;
            cssProperties.push(name);
        });
        //填补transition样式
        cssValues[animatePrototypes.transitionProperty] = cssProperties.join(', ');
        cssValues[animatePrototypes.transitionDuration] = duration + 's';
        cssValues[animatePrototypes.transitionDelay] = (delay || 0) + 's';
        cssValues[animatePrototypes.transitionTiming] = (ease || 'linear');

        if (callback) {
            onTransitionEnd(elem, callback, duration);
        }
        //设置样式
        for (var key in cssValues) {
            cssStr.push(key + ':' + cssValues[key]);
        }

        //聪明的同学，想想为什么？
        setTimeout(function () {
            elem.style.cssText += ';' + cssStr.join(';');
        }, 0);
    };

    window.animate = animate;
})(window);