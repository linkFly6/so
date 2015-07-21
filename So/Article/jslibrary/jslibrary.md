#JavaScript - 习以为常的组件规范

写这篇文章，第一是因为总是有人问我关于JavaScript组件的一些编写，其实一直以为，JS的组件都是根据社区的习惯墨守成规的。  
其次是因为web前端的技术更新如狂风暴雨一样，各项规范行为准则都在讨论等待敲定中，趁着组件化规范还没有确立，我们再来看看这些基础的类库如何去编写吧。  
  

> 本文内容如下：
> - 立即调用的函数表达式
> - 对象化
> - 模块化
> - jQuery的组件
> - ECMAScript 6所带来的
> - Web Components
> - 结语
> - 参考和引用

>**JavaScript - 前端开发交流群：377786580**

##立即调用的函数表达式
先不谈"立即调用的函数表达式"。所有的组件都是给别人使用的，直接声明全局变量难免会重名，所以为了保证变量不冲突，需要有个安全的空间来执行我们的代码，而js里没有块作用域（ECMAScript 6新增了块级作用域），只有函数作用域，所以只能通过函数来封闭当前的空间：
```javascript
	var name = 'linkFly';//声明到window下了
	
	console.log(window.name);
	
	function foo() {
	    var bar = 'bar';
	}
	console.log(window.bar);//undefined
	console.log(bar);//error：bar is not defined
```
但是声明了函数，默认不会运行函数肿么办？所以我们还得调用函数`foo()`，"立即调用的函数表达式"由此而生。


立即调用的函数表达式（Immediately-Invoked Function Expression），一般我们简称为"匿名自执行"或者"自执行"函数，听起来很高大上的样子，其实下面的例子就演示了：  
```javascript
(function (window) {

    //dosomething()

})(window);
```

理解"匿名自执行"函数的关键点就是需要理解什么是[函数声明和函数表达式](http://www.cnblogs.com/TomXu/archive/2011/12/29/2290308.html)。
其实根据个人理解，说的浅显易懂的就是:
- 函数声明 - 有函数名称
- 函数表达式 - 函数声明/表达式的左侧有运算符/操作符

例如下面的代码：
```javascript
	function foo() { }//函数声明
	
	var bar = function () { }//函数表达式：左侧有运算符/操作符
```

来解释一下上面的代码：  
foo是一个典型的函数声明，这就是ECMAScript描述的语法，这就不用多说了。  
主要是下面的bar，bar的声明是这样一个过程：  
- 先声明一个匿名函数
- 然后赋值给变量bar

本质上来说，我们想要构建一个函数表达式，只要能让它产生运算过程即可，例如下面的代码：

```javascript
	(function () { });//声明一个匿名函数，然后通过分组运算符让它产生运算的过程
	
	!function () { };//声明一个匿名函数，然后通过!运算符取反
```

说了这么多函数表达式跟我们的"匿名自执行"函数有什么关系呢？好的关键点来了，我们平时声明一个函数都是这样调用的：
```javascript
	function foo() { }
	foo();
```

我们来演化一下：
```javascript
	function foo() { }foo(); //声明foo，然后立即调用
	
	(function () { })();//声明一个匿名函数，然后立即调用
	
	(function /*foo*/() { })/*foo*/();
	
	(function /*foo*/(window) { })/*foo*/(window);//既然是调用函数，那么传个参数神马的肯定是木问题的
```

相信已经很明白了，其实"匿名自执行"就是声明一个匿名函数，而声明匿名函数的前提是这个函数要有运算过程，所以通过()把匿名函数转换为函数表达式，然后调用这个匿名函数，从而完成"匿名函数调用"。

其实已经很简单就可以看出来，只要能让函数产生运算过程，就可以声明匿名函数。我们来感受下什么叫做玩代码：
```javascript
	//正常版
	(function () { })();
	(function () { }());
	
	//飘逸版
	+function () { }();
	-function () { }();
	!function () { }();
	~function () { }();
	
	//技法版
	var foo = function () { }();
	void function () { }();
	new function () { };
	new function () { }();
	
	//丧心病狂版
	[function () { }()]
	typeof function () { }();
	true && function () { }();
	false || function () { }();
	1 && function () { }();
	1 > function () { }();
	1 >> function () { }();
	true, new function () { }();
	
	//防御性匿名自执行
	; (function () { })();
```

最后那个"防御性匿名自执行"是为了和代码一起使用的时候，强行终止前面的代码，保证匿名自执行函数是正确的。

##对象化
尽可能基于对象编写组件，尽可能基于对象编写组件，尽可能基于对象编写组件，重要的事情要说三遍。JS可以用Function和prototype来模拟对象的行为：
```javascript
	(function (window) {
	
	    var Foo = function (elem) {
	        this.elem = elem;
	    };
	
	    Foo.prototype.show = function () {
	        this.elem.style.display = '';
	    };
	    Foo.prototype.hide = function () {
	        this.elem.style.display = 'none';
	    };
	
	
	    //注册到window下
	    window.Foo = Foo;
	
	})(window);
```
基于对象编写的优点
- 面向对象那几大经典特性就足够让人着迷了
- 更佳语义化
- API和属性统一便于管理
- 管理对象比管理一堆杂乱无章的函数会好很多

下面的代码就是作孽型代码：
```javascript
	(function (window) {
	
	    var globalElem;
	
	    var show = function () {
	        globalElem.style.display = '';
	    };
	    var hide = function () {
	        globalElem.style.display = 'none';
	    };
	
	    var init = function (elem) {
	        globalElem = elem;
	    }
	
	    window.BazInit = init;
	    window.BazShow = show;
	    window.BazHide = hide;
	
	})(window);

```

##模块化
前端的模块化有AMD、CMD、CommonJS之类的，见过这么一句话：
> 现在写个组件都要兼容各种加载  

我们先来汇总一下几个常见的模块化特点：

###AMD
AMD - 全局曝露define和define.amd，通过define定义模块

```javascript
    var Foo = function () { };
    if (typeof define === "function" && define.amd) {
        define('foo', [], function () {
            return Foo;
        });
    }  
```

###CommonJS
CommonJS - 全局曝露module和module.exports，通过module.exports曝露模块

```javascript
    var Foo = function () { }
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = function () {
            return Foo;
        };
    }
```

###CMD
CMD - 全局曝露define和define.cmd，通过define定义模块

```javascript
    var Foo = function () { };
    if (typeof define === "function" && define.cmd) {
        define('foo', [], function () {
            return Foo;
        });
    }
```

###兼容各种模块化的组件
```javascript
	(function (global, factory) {
	    if (typeof define === "function" && define.amd) {
	        //AMD
	        define("foo", [], function () {
	            return factory(global);
	        });
	    } else if (typeof define === "function" && define.cmd) {
	        //CMD
	        define("foo", [], function () {
	            return factory(global);
	        });
	    } else if (typeof module === "object" && typeof module.exports === "object") {
	        //node/commonJs
	        module.exports = factory(global, true);
	    } else {
	        //browser
	        factory(global);
	    }
	})(typeof window !== 'undefined' ? window : this, function (window, noGlobal) {
	
	    var Foo = function () { };
	
	    if (noGlobal !== true)//如果不是Node环境下，暴露一份到全局变量下
	        window.Foo = Foo;
	
	    return Foo;
	
	});
```


##jQuery的组件
jQuery的强大众所周知，jQuery的崛起也离不开jQuery社区里各种组件的大力贡献，同时jQuery自身也为组件提供了非常良好的基础工具：

###jQuery.fn.data - 数据中心
jQuery是基于DOM工作的，而jQuery.fn.data则是让一个DOM和一组数据进行关联，支持HTML5的[HTMLElement.dataset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset)。

```javascript
	(function ($) {
	    var Foo = function ($elem) {
	        //doSomething($elem)
	    };
	    Foo.prototype.bar = function () { };
	
	    $.fn.foo = function () {
	        //jQuery是类数组对象：http://www.cnblogs.com/silin6/p/ArrayLike.html
	        this.each(function () {
	            //循环每个DOM
	            var $this = $(this),
	                data = $this.data('bar');//获取每个DOM上挂载的名为bar的数据
	            if (!data) {
	                //如果没有数据，则创建一个我们的组件对象，并和这个DOM关联
	                data = new Foo($this);
	                $this.data('bar', data);
	            };
	            return data;//返回我们的组件对象
	        });
	    };
	
	    //调用方式：$('#baz').foo().bar();
	
	})(jQuery);
```



###jQuery.fn.on/jQuery.fn.trigger - 自定义事件



###各种检索工具


##ECMAScript 6所带来的

###module

###class


##Web Components


##结语

##参考和引用