#JavaScript - 基于CSS3动画的实现

<div class="l-index">
<p>
在痛苦的IE8时代，所有的动画都只能基于自己计算相关动画属性，开定时器setTimeout/setInterval轮询动画任务。 
</p>
<p>  
而肩负重任的HTML5，早已注意到了日益增强的动画，随着HTML5的降临，带来了强劲的CSS3动画，本文主要探讨：乘着CSS3的风，实现JS动画——探索现代画风的js动画。
</p> 
</div>
> 本文内容如下：
> - CSS3动画
> - 基于CSS3的动画本质
> - 封装基于CSS3的动画API
> - 事件处理
> - 结语
> - 参考和引用

>**JavaScript - 前端开发交流群：377786580**

##CSS3动画
CSS3的动画各种文章漫天飞已经讲烂了，CSS3到目前为止总共新增了两个动画属性：`transition`、`animation`。这里只关注我们目前要用的的部分：`transition`。至于`animation`的部分请参考《[MDN - 使用CSS动画](https://developer.mozilla.org/zh-CN/docs/Web/Guide/CSS/Using_CSS_animations)》。
  
CSS3让动画前所未有的简单，下面的例子演示了`transition`，当点击div.demo的时候，div.demo向右偏移200px：

```html
        <style>
            .demo { background-color: #0094ff; width: 100px; height: 100px; position: absolute;left: 0; 
                    transition: left /*要执行动画的属性*/
                                linear /*动画曲线*/
                                1s; /*动画执行时间*/ }
        </style>
        <div class="demo" onclick="javascript: this.style.left = '200px';"></div>
```
上面一段`transition`的意思就是：
- 指定动画的属性为left，对left所有的操作都会触发动画
- 指定动画的曲线（贝塞尔函数）
- 指定动画的执行时间

仔细看看代码也就能发现，其实`transition`和`background`一样也是简写属性，是这几个CSS3新增属性的简写：
- transition-property - 指定动画的属性，可以指定多个，用,号分隔
- transition-timing-function - 指定动画的曲线（贝塞尔曲线）
- transition-duration - 指定动画的执行时间
- transition-delay - 指定动画延迟时间

这两段代码意义相同：
```css
            transition: left            /*要执行动画的属性*/
                        linear: ;       /*动画曲线*/
                        1s;             /*动画执行时间*/



            transition-property:left;           /*动画属性*/
            transition-timing-function:linear;  /*动画曲线*/
            transition-duration:1s;             /*执行时间*/
            transition-delay:0;                 /*动画延迟时间*/
```

效果如图：  
![css-animation-demo](http://images.cnblogs.com/cnblogs_com/silin6/596820/o_css-animation-demo.gif)


早期实现动画比较麻烦，需要使用类似下面JS的原理来实现：
```html
    <div class="demo" id="demo" style="left:0"></div>
    <script>
        var elem = document.getElementById('demo'),//获取元素
            elemStyleSheet = elem.style,//元素的内联样式对象
            left = parseInt(elemStyleSheet.left),//获取当前left
            targetLeft = 200,//目标left
            time = 13,//动画每帧间隔
            offsetValue = targetLeft / parseInt(1000 / 13),//每帧偏移量
            intervalId,
            temp;//临时变量
        
        elem.onclick = function () {
            intervalId = setInterval(function () {
                //追加偏移量
                temp = parseInt(elemStyleSheet.left) + offsetValue;
                elemStyleSheet.left = temp + 'px';

                if (temp >= targetLeft)//完成动画
                    clearInterval(intervalId);
            }, time);
        };
    </script>
```

效果和上面的css3实现的一样。大体意思就是计算出动画的帧数、每帧间隔、每帧动画的偏移量，然后开个定时器一直重复执行，直到动画完成。具体高能版实现可以参阅[jQuery.animate](https://github.com/jquery/jquery/blob/1.11.3/src/effects.js)。

这里需要注意：早期的动画都是基于定时器`setTimeout/setInterval`来轮询动画任务，它们本身的模型就不是为了动画而打造的，实现动画的性能上实在堪忧，所以现代浏览器都部署了新的API `requestAnimationFrame`来弥补`setTimeout/setInterval`在动画方面天生的表现力不足。
  
近期jQuery发布了[jQuery3.0 预览版](http://blog.jquery.com/2014/10/29/jquery-3-0-the-next-generations/)，就使用了`requestAnimationFrame`来完成动画。

&nbsp;

##基于CSS3的动画本质

`transition`可以驱动（作为动画）的属性太多太多，例如：
- 位置：left、top、right、bottom
- CSS3的`transform`变形和z轴偏移,参阅[CSS3 Transform ](http://www.w3cplus.com/content/css3-transform)
- 透明度：opacity
- 宽高：height/width
- 颜色(color)
- 边框(border)
- 边距（margin/padding）
- 等等等等

在支持CSS3的情况下，如果我们想执行动画，本质上都可以使用`transition`来驱动。因为`transition`已经封装好了动画的行为，我们只需要指定`transition`需要的一些关键属性值即可。  
所以这个动画的实现，本质上就是一个给DOM赋上CSS3的属性`transition`，然而我们早已就看透了一切。

&nbsp;

##封装基于CSS3的动画API
既然CSS3自身就已经实现了相关动画属性，那么封装API这种事情就变得十分简单了，拿我们最初的例子来说，可以使用如下js代码：
```html
        <style>
            .demo { background-color: #0094ff; width: 100px; height: 100px; position: absolute; }
        </style>
        <div class="demo" id="demo"></div>
        <script>
            var elem = document.getElementById('demo'),
                elemStyleSheet = elem.style;//元素的内联样式对象
            //赋上transition
            elemStyleSheet.cssText = 'left:0; transition: left linear 1s;';
            elem.onclick = function () {
                elemStyleSheet.left = '200px';
            }
        </script>
```

核心代码其实就2行，附上`transition`和关键属性即可。是不是突然觉得动画真是so easy~~~

程序是要有健壮性的，既然我们发现了这么个"天大的秘密"，是不是封装成API以后给自己、给基友使用更好呢？看起来就觉得很高大上一样，那我们来封装下API吧。

最简短的封装就是把`transition`的四个属性封装传递进来就可以了：
```javascript
    var animate = function (elem, propertys, ease, duration, delay) {
        var cssText = [],
            props = [];
        for (var name in propertys) {
            props.push(name);//提取要执行动画的属性

            //提取动画目标样式
            cssText.push(name + ':' +
                    //如果是number，则追加px单位
                    (typeof propertys[name] === 'number' ? propertys[name] + 'px' : propertys[name]));
        }

        //添加transition样式
        cssText.push('transition-property:' + props.join(''));
        cssText.push('transition-timing-function:' + (ease || 'linear'));
        cssText.push('transition-duration:' + (duration || 300) + 's')
        cssText.push('transition-delay:' + (delay || 0));

        //添加元素样式
        elem.style.cssText += ';' + cssText.join(';');
    };

```

大体意思就是把`transition-*`的属性通过外面的参数传递进来，然后我们做下拼接的处理，然后给元素新增上样式属性就可以了。
代码到了这里，我们来看看成果，毕竟我们仅使用了12行代码就完成了JS的动画。[戳这里查看运行demo](http://runjs.cn/detail/grpl3ezl)。

&nbsp;

##事件处理

到了这里，我们会发现其实API和`jQuery.animate`很像很像，哟吼，看起来很不错的样子，等等，好像还缺了点什么。  
仔细想想，我们还缺少一个重要的东西：**动画结束事件**。  
我们往往有很多的需要的任务都是在动画结束事件里完成的，但是我们怎么能没有动画结束这么重要的事件呢，别着急，国外那群搞浏览器的，也已经为大家讨论出了结果（当然也还有其他动画事件）：
使用`transition`的动画，提供一个动画结束的事件：`onTransitionEnd`。

我们再在刚才的demo下追加一行添加`onTransitionEnd`事件的代码：
```javascript
    //动画结束事件
    elem.addEventListener('transitionend', function () {
        alert('动画结束了！！！');
    });
```
[戳这里查看运行demo](http://runjs.cn/detail/fhjjuvnz)

我们再来看看`onTransitionEnd`事件的兼容性：
![onTransitionEnd](http://images.cnblogs.com/cnblogs_com/silin6/596820/o_onTransitionEnd.png)


嗯，其实有些浏览器很早以前的实现都是私有实现，这里为了防止出现意外，还是嗅探一下浏览器吧，针对浏览器的私有实现，我们绑定私有事件。  
当然我们应该考虑的更周全一点，既然都已经嗅探了私有事件，我们一同嗅探出私有属性吧，防止有些浏览器不支持标准的CSS但是私有实现了`transition`：
```javascript
    var testElem = document.createElement('div'),
        //各大浏览器私有属性：transitionProperty、webkitTransitionProperty、transitionProperty、oTransitionProperty、msTransitionProperty
        vendors = { '': '', 'Webkit': 'webkit', 'Moz': '', 'O': 'o', 'ms': 'ms' },
         /*
             https://github.com/madrobby/zepto/pull/742
             firefox从未支持过mozTransitionEnd或MozTransitionEnd，firefox一直支持标准的事件transitionend
         */
        normalizeEvent = function (name) {
            return eventPrefix ? eventPrefix + name : name.toLowerCase();
        },
        //私有css前缀
        cssPrefix = null,
        //私有事件前缀
        eventPrefix = null,
        //私有事件
        onTransitionEnd = null;

    for (var name in vendors) {
        //嗅探特性
        if (testElem.style[(name ? name + 'T' : 't') + 'ransitionProperty'] !== undefined) {
            cssPrefix = name ? '-' + name.toLowerCase() + '-' : name;
            eventPrefix = eventPrefix;
            onTransitionEnd = normalizeEvent('TransitionEnd');
            break;
        }
    }
```

&nbsp;

最后，我们整理一下代码，把这些私有属性的嗅探和之前的代码进行融合，同时做一些优雅降级的处理。一个轻量级的，基于CSS3的JS动画就这么实现了。

&nbsp;

```javascript
(function (window) {
    var Support = {
        cssPrefix: null,
        eventPrefix: null,
        onTransitionEnd: null
    },
    testElem = document.createElement('div'),
    //transitionProperty、webkitTransitionProperty、transitionDuration、oTransitionDuration、msTransitionProperty
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
    * animate(elem, properties, duration, delay)
    * animate(elem, properties, duration, ease)
    * animate(elem, properties, duration, callback, delay)
    * animate(elem, properties, duration, ease, callback, delay)
    * @param {int} elem - 要执行动画的元素
    * @param {function|string} properties - 动画执行的目标属性，为String则表示是animation-name，为object则是transition-property
    * @param {int} duration - 动画执行时间(ms)
    * @param {string} [ease = linear] - 动画线性
    * @param {function} [callback = null] - 动画执行完成的回调函数
    * @param {int} [delay = 0] - 动画延迟(s)
    * @returns {null}
    */
    var animate = function (elem, properties, duration, ease, callback, delay) {
        //修正参数支持重载
        if (typeof ease === 'function') {
            //重载
            delay = callback;
            callback = ease;
            ease = null;
        }
        if (ease > 0) {
            delay = ease;
            ease = null;
        };
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
```

运行效果如图：  
![animate-demo](http://images.cnblogs.com/cnblogs_com/silin6/596820/o_animate-demo.gif)


[戳这里查看完整demo](http://runjs.cn/detail/donkrfk7)


##结语
HTML5和CSS3为前端注入了巨大的力量，CSS3强大的动画现在各大网站随处可见，而现在web前端的技术更新又异常的快，前端的技术也层出不穷，各种新的卓越的概念各种涌现。  
但是我们在这一片繁华的背后，也应该深刻的思考技术的根基。在眼花缭乱的技术背后，看破本质，务必时刻掌控住你的代码和思想。  
这篇文章主要分析了`transition`，其实这里还可以兼容CSS另外一个动画：`animation`，聪明的童鞋，思考思考如何去做？  
再谈点自己：最近很忙，离职了又入职。重构组里的前端开发，各种评估框架，完善基础类库，组里准备给前端中间驾一层Node，自己又在开发自己的个人博客网站，忙的各种没时间更新。
另外，招人，要求只有一点：对代码有追求。


> __JavaScript - 前端开发交流群：377786580__

##参考和引用
[zepto.js - fx模块源码](https://github.com/madrobby/zepto/blob/master/src/fx.js)  
[Modernizr.js源码](https://github.com/Modernizr/Modernizr)  
[swipe.js源码](https://github.com/thebird/Swipe/blob/master/swipe.js)


<div class="l-author">
<div>作者：linkFly</div>
<div>原文：<a href="http://www.cnblogs.com/silin6/p/animate.html">http://www.cnblogs.com/silin6/p/animate.html</a></div>
<div>出处：<a href="http://www.cnblogs.com/silin6/">www.cnblogs.com/silin6/</a></div>
<div>声明：嘿！你都拷走上面那么一大段了，我觉得你应该也不介意顺便拷走这一小段，希望你能够在每一次的引用中都保留这一段声明，尊重作者的辛勤劳动成果，本文与博客园共享。</div>
</div>