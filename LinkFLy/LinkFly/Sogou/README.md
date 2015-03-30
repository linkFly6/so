# 搜狗移动搜索前端优化

&nbsp;&nbsp;

##移动搜索

移动搜索本身就应该是个很轻量的概念，但由于目前以XML为数据源，导入了二次加载的体系以及一些商业化因素，导致了移动搜索逐渐变得有点重。而又内部基础类库没有及时更新，所以造成了每个做VR的都是在原代码上进行copy，大量不同版本、风格的代码在VR体系中难以管理。

在VR体系中应该仍然保持搜索这个轻量级的概念，所以应该主要优化在增强基础类库上。

- 二次加载的封装
- 二次请求参数的封装
- 字符串模板
- QoInfo中vrQuery转换为对象封装
- 按行截断（UED目前有按行截断的样式，但是使用有条件约束）
- 所有的Img标签的规范化，onload/**onerror**默认处理
- 由于部分数据依赖外部接口和二次加载，但并不是每个VR都有Loading的处理，需要规范化
- 动画规范，我们的左右touch滑动是不是应该给出个良好的兼容解决方案？

[这里][1]整理了自己平时使用的函数。
[这里][2]是后来实现的SogouGps。

我们还有很多需要实现和规范的，例如注册VR代码命名空间的函数，统一的定位Cookie，可以返回预编译函数的getId()，浏览器、系统当前信息函数，常用正则表达式工具对象，性能更加的字符串拼接函数等等等等，只是尚未有人去推行这些规范而已。

&nbsp;&nbsp;
&nbsp;&nbsp;
    

##服务搜索


服务搜索从建立之初就决定了它和VR有着很大的出入，最主要是因为这个体系中数据是二次加载的，由js完成整个前端的逻辑——数据从无到有到展现到逻辑精化处理——这已经是一个轻量的Web App的概念。

然而因为时间和人手等关系，服务体系起步匆匆忙忙，到现在仍然没有一个良好的前端服务模型。由于是从VR体系继承过来的，所以有着和VR体系相同的问题，所以基础的解决方案和VR体系相同。
但服务体系毕竟和VR概念不同：VR偏轻，概念是优质搜索结果的精致展现。而服务偏重，提供的一整套服务。所以逻辑分离在服务中显的尤为重要。

- 良好的基础扩展和Core。
- 异步
- XML处理
- 更多

###良好的基础扩展和Core
---
目前的服务大同小异，也已经成型了一些公共组件：定位、城市选择、区域选择。我们尝试过一些组件化开发，但由于业务精分粒度不同，区域选择至今仍然有2份数据源，所以造成了两个版本的区域选择，其实两个版本的区域选择组件根据业务精度划分开也不是不可，只是这两个区域选择组件都偏重——因为没有基础函数，所以这两个区域选择组件都重写了一遍基础工具，导致很重。

一个项目中如果想要推行组件，必然需要有基础的核心模块为这些组件提供一些可复用的基础，就如同jQuery和jQuery的插件一样。

例如[underscore.js][3] —— 它的核心是提供一些方便快捷的函数，编写类库和组件提供工具。

当然我并非说要使用它，实际上它的一些API并不适用于我们，我只是表达应该有这么个玩意，能提供给我们的组件一些很基础的东西，最好是迎合我们业务的。

配合Zepto内置的（自定义）事件驱动模型，可以编写出一些非常良好的组件。

这个核心的模块应该封装了上面VR体系里面的共用函数（例如`字符串模板`），同时这个核心库的思想，会直接影响到整个项目前端的开发和思想。


###异步
---
服务中大量的数据源于异步加载，所以应该为异步提供一个好的解决方案，过去的异步回调函数嵌套回调函数本身就是值得商榷的代码。所以我这一段时间一直在研究js异步编程，希望给出一个解决方案。
我自己实现了一个针对我们业务的[DeferJsonp][4]，但它的模型不是很好，最近在重新编写一个新的异步解决方案。

异步解决方案，在ECMAScript 6中得到解决——Promise对象。

关于它，可以参考这些。

- [Promise/A+规范][5]
- [JavaScript Promise启示录][6]
- [ECMAScript 6的Promise对象][7]

规范已经出来了，所以如果要给解决方案，应该是针对我们的业务（主要让它直接支持jsonp和ajax，Promise要支持jsonp需要封装）进行一些扩展。

###XML处理
---
因为我们大部分数据约定是XML，应该有合适的简单便捷的XML库。

我编写了[X.js][8]，只是由于WP的XML API并不正确，所以提供了在WP下XML操作的降级，但并未完善。

###更多
---
1、路由机制：
>  
在服务中经常遇见通过url hash来标记整个页面的参数和跳转，应该有良好的路由机制来完成这些标记，并可以通过路由机制切割出页面（目前我们使用url hash来标记web中的某一个“页面”，但实际上它是个单页web）的概念，通过路由切割开单页web中，每个“子页”的逻辑。
路由机制可以参考backbone。

2、VR和服务中的共用弹出
> 
VR弹出模态框一直是循环整个页面的DOM并隐藏，然后弹出模态框，性能堪忧。需要为整个VR页面做出相关的约定，给定一个非常良好的弹出系列API（关注弹出时VR页面本身响应的动作，如隐藏，或被模态框背景覆盖，而不要关注弹出的内容是什么）。



&nbsp;&nbsp;
&nbsp;&nbsp;

##一些思考

###在代码中养成组件化思维-逻辑和UI分离
---

现在的代码多数都是逻辑和UI混在一起的，需求和UED改动会造成代码经常变动甚至大改。切割逻辑和UI目前在前端界已经有了很多层出不同的框架，但由于这些框架会强势侵入你的编程思想导致上手难度很大。但一旦习惯，会给前端后续的开发、优化工作带来不可估量的奇效。

- MVC的[Backbone][9]
- MVVM的[knockoutJS][10] （上手难度偏高）

考虑到当前人手和时间因素，把这些应用进来并不是太过恰当，所以我们只能从现在在自己的代码中开始改变——尝试逻辑和UI进行分离。

团队里所有人编写的代码都是UI和逻辑强势揉合的，任何一个组件应该有自己的对象模型，并且这个对象模型仅关注逻辑的实现，当这个组件最终曝露给外部（例如jQuery的组件暴露给jQuery.fn，Zepto的组件暴露给Zepto.prototype）才去关注UI。

简而言之，任何和业务相关的组件，都应该是两部分组成：业务逻辑和UI。

我在[这篇文章][11]提及过这种思想，实际上这样来编写代码会为我们未来的前端技术发展作出良好的铺垫，当我们把业务逻辑和UI进行分离，后续再注入类似MVVM框架的时候，就会显得异常轻松，因为MVVM本质上只是接管了你的UI和数据绑定。

Bootstrap中很多组件都带有这样的血统，值得参考。组件化是Web前端的发展方向，现在W3C已经单独成立了一个小组研究这项面向未来的技术——[Web Components][12]。

###前端自动化
---
前端自动化工具[Grunt][13]可以帮助我们完成很多自动化任务。例如js自动压缩，根据HTML自动生成js拼接字符串代码，js文件合并压缩等等。

###前端模块化
---
AMD的起源于NodeJS，NodeJS中涉及到大量处理逻辑，所以模块化必不可少，AMD的实现[requireJS][14]则是把这套模型搬到前端。

但对于它的使用觉得适合开发环境，上线之前代码所有模块化的代码都应该合并，不应该requireJS的异步jsonp加载，从而造成更多开启http所造成的性能和流量开销。

有人和我提过一个想法，就是检测js中引用的模块，然后自动在前端进行引用，但觉得这种想法在前端应用只会增加代码开发复杂度，带来的收益甚微。

在VR中可以使用过组件的VR毕竟就那么几个，但服务中，随着服务复杂度的提升肯定会越来越多，不过服务的业务集中，不像VR那样是多个VR组成的一个页面，所以服务中直接在&lt;script&gt;标签中引用这个页面所依赖的所有模块，能优化的就是：
&lt;script&gt;的`src`属性发起的url，可以附带参数，可以附带一个`mudules`参数来表示这页面想要引用的模块，从而达到一个&lt;script&gt;标签即可返回所有依赖的模块，如下：
```html
    <script src="http://fuwu.wap.sogou.com/resource/fuwu/js/require?mudules=zepto|x" type="text/javascript">
    </script><!--引用zepto.js、x.js-->
```


###代码优化
---
1、变量缓存和减少DOM操作，js自身的性能极高，但一旦和DOM挂钩那么性能将会大有损失，应该把避免除展示之外的数据和DOM关联
```javascript
    var testDOM = document.getElementById('test'),
        childCollection = testDOM.children,//缓存节点的children，减少DOM访问
        len = childCollection.length,//缓存length，减少DOM访问
        i = 0,
        itemDOM;
    //缓存当前访问的节点，减少DOM对HTMLCollection的访问
    while ((itemDOM = childCollection[i++]))
        itemDOM.innerHTML = 'test';
```

&nbsp;

2、任何函数都不应该依赖外部变量，除了工具函数，其他的函数都应该是依赖在对象上的方法

```javascript
    //不应该编写这种代码
    var $elem;
    function switchShow(isShow) {
        //操作$elem
    }
    function changeText(text) {
        //操作$elem
    }
    function init(id) {
        $elem = $('#' + id);
    }
    var demo = init('test');




    //应该重构成这样
    function ToggleObject(id) {
        if (!(this instanceof ToggleObject))
            return new ToggleObject(id);
        var $elem = $('#' + id);
        return {
            switchShow: function (isShow) {
                //操作$elem
            },
            changeText: function (text) {
                //操作$elem
            }
        };
    }
    var demo = ToggleObject('test');
```

&nbsp;


3、利用函数声明语义化代码，我们应该明确JavaScript中函数声明会发生变量置顶的效果，所以我们可以利用这一特性来语义我们的代码。

```javascript
    function demo(id) {
        var $elem = $('#' + id);
        return function (isShow, text) {
            switchShow($elem, isShow);
            changeText($elem, text);
        };
        //函数置顶
        function switchShow($elem, isShow) {

        }
        function changeText($elem, text) {

        }
    }

```

最后不得不提：随着对异步（二次）加载的业务提升和依赖，XML相对于移动端，作为数据源真的实在太大，但一旦需要改造也并不是一项很小的工程，但未来必然是个不可忽略的优化点。


最好的代码优化和项目模型是迎合业务逻辑和真实环境的，所以无法表述，大体思路是：服务可以重，VR必须轻。

---

最后祝大家事业高升。


  [1]: https://github.com/linkFly6/linkfly.so/blob/master/LinkFLy/LinkFly/Sogou/builder.js
  [2]: https://github.com/linkFly6/linkfly.so/blob/master/LinkFLy/LinkFly/Sogou/SogouGps.js
  [3]: http://www.css88.com/doc/underscore/
  [4]: https://github.com/linkFly6/linkfly.so/blob/master/LinkFLy/Code/DeferJsonp/DeferJsonp.js
  [5]: http://segmentfault.com/a/1190000002452115
  [6]: https://www.dmfeel.com/post/536799f91f1bf49646000001
  [7]: http://www.cnblogs.com/silin6/p/4288967.html
  [8]: https://github.com/linkFly6/linkfly.so/tree/master/LinkFLy/Code/X
  [9]: http://www.css88.com/doc/backbone/tree/master/LinkFLy/Code/X
  [10]: http://www.cnblogs.com/TomXu/archive/2011/11/21/2257154.html
  [11]: http://www.cnblogs.com/silin6/p/4273511.html
  [12]: http://fex.baidu.com/blog/2014/05/web-components-future-oriented/
  [13]: http://www.gruntjs.net/
  [14]: http://www.requirejs.cn/