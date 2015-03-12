# JavaScript异步编程（2）- 先驱者：jsDeferred 

<div class="l-index">
<p>
JavaScript当前有众多实现异步编程的方式，最为耀眼的就是ES 6规范中的Promise，它来自于CommonJS小组的努力：Promise/A+规范。
</p>
<p>研究javascript的异步编程，jsDeferred也是有必要探索的：因为Promise/A+规范的制定基本上是鉴定在jsDeferred上，它是javascript异步编程中里程碑式的作品。jsDeferred自身的实现也是非常有意思的。</p>
<p>本文将探讨项目jsDeferred的模型，带我们感受一个不一样的异步编程体验和实现。</p>
</div>
> 本文内容如下：  
>  
> - jsDeferred和Promise/A+
> - jsDeferred的工作模型
> - jsDeferred API
> - 参考和引用


##jsDeferred和Promise/A+
在上一篇文章《[JavaScript异步编程（1）- ECMAScript 6的Promise对象][1]》中，我们讨论了ECMAScript 6的Promise对象，这一篇我们来看javascript异步编程的先驱者——jsDeferred。

[jsDeferred][2]是日本javascript高手[geek cho45][3]受MochiKit.Async.Deferred模块启发在2007年开发（2007年就玩这个了...(/ □ \)）的一个异步执行类库。我们将jsDeferred的原型和[Promise/A+规范][4]（[译文戳这里][5]）进行对比（来自[@^_^肥仔John][6]的《[JS魔法堂：jsDeferred源码剖析][7]》）：

###Promise/A+
> - Promise是基于状态的
> - 状态标识：pending（初始状态）、fulfilled（成功状态）和rejected（失败状态）。
> - 状态为单方向移动“pending->fulfilled"，"pending->rejected"。
> - 由于存在状态标识，所以支持晚事件处理的晚绑定。


###jsDeferred
> - jsDeferred是基于事件的，并没有状态标识
> - 实例的成功/失败事件是基于事件触发而被调用
> - 因为没有状态标识，所以可以多次触发成功/失败事件
> - 不支持晚绑定


##jsDeferred的工作模型
下面一张图粗略演示了jsDeferred的工作模型。
![jsDeferred Model][8]

下面涉及到jsDeferred的源码，对于第一次接触的童鞋请直接拉到API一节（下一节），读完了API再来看这里。

jsDeferred第一次调用next有着不同的处理，jsDeferred在第一次调用next()的时候，会立即__异步__执行这个回调函数——而这个挂起异步，则视当前的环境（如浏览器最佳环境）选择最优的异步挂起方案，例如现代浏览器下会通过创建Image对象的方式来进行异步挂起，摘录源码如下：
```javascript
Deferred.next_faster_way_Image = ((typeof window === 'object') && (typeof (Image) != "undefined") && !window.opera && document.addEventListener) && function (fun) {
    // Modern Browsers
    var d = new Deferred();
    var img = new Image();
    var handler = function () {
        d.canceller();
        d.call();
    };
    //进行异步挂起
    img.addEventListener("load", handler, false);
    img.addEventListener("error", handler, false);
    d.canceller = function () {
        img.removeEventListener("load", handler, false);
        img.removeEventListener("error", handler, false);
    };
    img.src = "data:image/png," + Math.random();
    if (fun) d.callback.ok = fun;
    return d;
};
```
Deferred对象的静态方法 - Deferred.next()源码：
```javascript
Deferred.next =
	Deferred.next_faster_way_readystatechange ||//IE下使用onreadystatechange()
	Deferred.next_faster_way_Image ||//现代浏览器下使用Image对象onload/onerror事件
	Deferred.next_tick ||//Node下使用process.nextTick()
	Deferred.next_default;//默认使用setTimeout
```

我们务必要理清Deferred.next()和Deferred.prototype.next()，这是两种不同的东西：
- Deferred.next()的职责是压入异步的代码，并立即异步执行的。
- Deferred.prototype.next()是从上一个Deferred对象链中构建的Deferred。当没有上一个Deferred链的时候，它并不会执行next()中压入的函数，它的执行继承于上一个Deferred触发的事件或自身事件的触发&#91; call / fail &#93;。
摘录源码如下：
```javascript
        Deferred.prototype = {
            callback: {},
            next: function (fun) {//压入一个函数并返回新的Deferred对象
                return this._post("ok", fun)
            },
            call: function (val) {//触发当前Deferred成功的事件
                return this._fire("ok", val)
            },
            _post: function (okng, fun) {//next()底层
                this._next = new Deferred();
                this._next.callback[okng] = fun;
                return this._next;
            },
            _fire: function (okng, value) {//call()底层
                var next = "ok";
                try {
                    //调用deferred对象相应的事件处理函数
                    value = this.callback[okng].call(this, value);
                } catch (e) {
                    //抛出异常则进入fail()
                    next = "ng";
                    value = e;
                    if (Deferred.onerror) Deferred.onerror(e);
                }
                if (Deferred.isDeferred(value)) {
                    //在这里，和_post()呼应，调用Deferred链的下一个Deferred对象
                    value._next = this._next;
                } else {
                    if (this._next) this._next._fire(next, value);
                }
                return this;
            }
        }
```

再一次强调，务必搞清楚Deferred.next()和Deferred.prototype.next()。

##jsDeferred API
当我第一次知道jsDeferred API有一坨的时候，其实我是，是拒绝的。我跟你讲，我拒绝，因为其实我觉得这根本要不了一坨，但正妹跟我讲，jsDeferred内部会加特技，是假的一坨，是表面看起来一坨。加了特技之后，jsDeferred duang～duang～duang～，很酷，很炫，很酷炫。

jsDeferred的API众多，因为jsDeferred把所有的异步问题都划分到了最小的粒子，这些API相互进行组合则可以完成逆天的异步能力，在后续的API示例中可以看到jsDeferred API组合从而完成强大的异步编程。
貌似没有看到过jsDeferred的详细的中文API文档（[原API文档][9]），就这里顺便整理一份简单的出来（虽然它的API已经足够通俗易懂了）。值得一提的是官网的API引导例子非常的生动和实用：

__Deferred()/new Deferred ()__
> 
构造函数(constructor)，创建一个Deferred对象。

```javascript
        var defer = Deferred();//或new Deferred()
        //创建一个Deferred对象

        defer.next(function () {
            console.log('ok');
        }).error(function (text) {
            console.log(text);//=> linkFly
        }).fail('linkFly');
        
```
__实例方法__

__Deferred.prototype.next和Deferred.prototype.call__
> 
Deferred.prototype.next()构建一个全新的Deferred对象，并为它绑定成功事件处理函数，在没有调用Deferred.prototype.call()之前这个事件处理函数并不会执行。

```javascript
        var deferred = Deferred();
        deferred.next(function (value) {
            console.log(value); // => linkFly
        }).call('linkFly');
```

__Deferred.prototype.error和Deferred.prototype.fail__
>
Deferred.prototype.error()构建一个全新的Deferred对象，并为它绑定失败事件处理函数，在没有调用Deferred.prototype.fail()之前这个事件处理函数并不会执行。

```javascript
        var deferred = Deferred();
        deferred.error(function () {
            console.log('error');// => error
        }).fail();
```


__Deferred所有的静态方法，都可以使用_Deferrd.方法名()_的方式调用。__

__Deferred.define(obj, list)__
> 
暴露静态方法到obj上，无参的情况下obj是全局对象：侵入性极强，但使用方便。list是一组方法，这组方法会同时注册到obj上。

```javascript
        Deferred.define();//无参，侵入式，默认全局对象，浏览器环境为window
        next(function () {
            console.log('ok');
        });//静态方法入next被注册到了window下
        var defer = {};

        Deferred.define(defer);//非侵入式，Deferred的静态方法注册到了defer对象下
        defer.next(function () {
            console.log('ok');
        });
```

__Deferred.isDeferred(obj)__
> 
判断对象obj是否是jsDeferred对象的实例（Deferred对象）。

```javascript
        Deferred.define();
        console.log(Deferred.isDeferred({}));//=> false
        console.log(Deferred.isDeferred(wait(2)));//=> true
```

__Deferred.call(fn[,args]*)__
> 
创建一个Deferred实例，并且触发其成功事件。fn是成功后要执行的函数，后续的参数表示传递给fn的参数。

```javascript
        call(function (text) {
            console.log(text);//=> linkFly
        }, 'linkFly');
        console.log('hello,world!');// => 先输出
```

__Deferred.next(fn)__
> 
创建一个Deferred实例，并且触发其成功事件。fn是成功后要执行的函数，它等同于只有一个参数的call，即：Deferred.call(fn)

```javascript
		Deferred.define();
        next(function () {
            console.log('ok');
        });
        console.log('hello,world!');// => 先输出

		//上面的代码等同于下面的代码
		call(function () {
            console.log('ok');
        });
        console.log('hello,world!');// => 先输出
```

__Deferred.wait(time)__
> 
创建一个Deferred实例，并等待time_秒_后触发其成功事件，下面的代码首先弹出"Hello,"，2秒后弹出"World!"。

```javascript
	next(function () {
		alert('Hello,');
		return wait(2);//延迟2s后执行
	}).
	next(function (r) {
		alert('World!');
	});
	console.log('hello,world!');// => 先输出
```
__Deferred.loop(n, fun)__
> 
循环执行n次fun，并将最后一次执行fun()的返回值作为Deferred实例成功事件处理函数的参数，同样loop中循环执行的fun()也是异步的。

```javascript
        loop(3, function () {
            console.log(count);
            return count++;
        }).next(function (value) {
            console.info(value);// => 2
        });
		//上面的代码也是异步的（无阻塞的）
        console.info('linkFly');
```

__Deferred.parallel(dl[ ,fn]*)__
> 
把参数中非Deferred对象均转换为Deferred对象_通过Deferred.next()_，然后并行触发dl中的Deferred实例的成功事件。
当所有Deferred对象均调用了成功事件处理函数后，返回的Deferred实例则触发成功事件，并且所有返回值将被封装为数组作为Deferred实例的成功事件处理函数的入参。
parallel()强悍之处在于它的并归处理，它可以将参数中多次的异步最终并归到一起，这一点在JavaScript ajax嵌套中尤为重要：例如同时发送2条ajax请求，最终parallel()会并归这2条ajax返回的结果。
parallel()进行了3次重载：

- parallel(fn[ ,fn]*)：传入Function类型的参数，允许多个
- parallel(Array)：给定一个由Function组成的Array类型的参数
- parallel(Object)：给定一个对象，由对象中所有可枚举的Function构建Deferred

下面一张图演示了Deferred.parallel的工作模型，它可以理解为合并了3次ajax请求。
![Deferred.parallel][10]

```javascript
        Deferred.define();
        parallel(function () {
            //等待2秒后执行
            return wait(2).next(function () { return 'hello,'; });
        }, function () {
            return wait(1).next(function () { return 'world!' });
        }).next(function (values) {
            console.log(values);// =>  ["hello,", "world!"]
        });

```
当parallel传递的参数是一个对象的时候，返回值则是一个对象：
```javascript
        parallel({
            foo: wait(1).next(function () {
                return 1;
            }),
            bar: wait(2).next(function () {
                return 2;
            })
        }).next(function (values) {
            console.log(values);// =>  Object { foo=1, bar=2 }
        });
```

__Deferred.earlier(dl[ ,fn]*)__
> 
当参数中某一个Deferred对象调用了成功处理函数，则终止参数中其他Deferred对象的触发的成功事件，返回的Deferred实例则触发成功事件，并且那个触发成功事件的函数返回值将作为Deferred实例的成功事件处理函数的入参。
注意：Deferred.earlier()并不会通过Deferred.define(obj)暴露给obj，它只能通过Deferred.earlier()调用。

Deferred.earlier()内部的实现和Deferred.parallel()大同小异，但值得注意的是参数，它接受的是Deferred，而不是parallel()的Function：

- Deferred.earlier(Deferred[ ,Deferred]*)：传入__Deferred__类型的参数，允许多个
- Deferred.earlier(Array)：给定一个由__Deferred__组成的Array类型的参数
- Deferred.earlier(Object)：给定一个对象，由对象中所有可枚举的__Deferred__构建Deferred



```javascript
        Deferred.define();
        Deferred.earlier(
            wait(2).next(function () { return 'cnblog'; }),
            wait(1).next(function () { return 'linkFly' })//1s后执行成功
        ).next(function (values) {
            console.log(values);// 1s后 => [undefined, "linkFly"]
        });
```

__Deferred.repeat(n, fun)__
> 
循环执行fun方法n次，若fun的执行事件超过20毫秒则先将UI线程的控制权交出，等一会儿再执行下一轮的循环。
自己跑了一下，跑出问题来了...duang...求道友指点下迷津

```javascript
        Deferred.define();
        repeat(10, function (i) {
            if (i === 6) {
                var starTime = new Date();
                while (new Date().getTime() - starTime < 50) console.info(new Date().getTime() - starTime);//到6之后时候不应该再执行了，因为这个函数的执行超过了20ms
            }
            console.log(i); //=> 0,1,2,3,4,5,6,7,8,9
        });
```

__Deferred.chain(args)__
> 
chain()方法的参数比较独特，可以接受多个参数，参数类型可以是：Function，Object，Array。
chain()方法比较难懂，它是将所有的参数构造出一条Deferred方法链。

例如Function类型的参数：
```javascript
        Deferred.define();
        chain(
            function () {
                console.log('start');
            },
            function () {
                console.log('linkFly');
            }
        );

        //等同于
        next(function () {
            console.log('start');
        }).next(function () {
            console.log('linkFly');
        });
```

它通过函数名来判断函数：
```javascript
        chain(
            //函数名!=error，则默认为next
            function () {
                throw Error('error');
            },
            //函数名为error
            function error(e) {
                console.log(e.message);
            }
        );

        //等同于
        next(function () {
            throw Error('error');
        }).error(function (e) {
            console.log(e.message);
        });
```

也支持Deferred.parallel()的方式：
```javascript
        chain(
            [
                function () {
                    return wait(1);
                },
                function () {
                    return wait(2);
                }
            ]
        ).next(function () {
            console.log('ok');
        });

        //等同于
        Deferred.parallel([
            function () {
                return wait(1);
            },
            function () {
                return wait(2);
            }
        ]).next(function () {
            console.log('ok');
        });
```

当然可以组合参数：
```javascript
        chain(
            function () {
                throw Error('error');
            },
            //函数名为error
            function error(e) {
                console.log(e.message);
            },
            //组合Deferred.parallel()的方式
            [
                function () {
                    return wait(1);
                },
                function () {
                    return wait(2);
                }
            ]
        ).next(function () {
            console.log('ok');
        });


        //等同于
        next(function () {
            throw Error('error');
        }).error(function (e) {
            console.log(e.message);
        });

        Deferred.parallel([
            function () {
                return wait(1);
            },
            function () {
                return wait(2);
            }
        ]).next(function () {
            console.log('ok');
        });
```

__Deferred.connect(funo, options)__
> 
将一个函数封装为Deferred对象，其目的是融入现有的异步编程。
注意：Deferred.connect()和Deferred.earlier()方法一样，并不会通过Deferred.define(obj)暴露给obj，它只能通过Deferred.connect()调用。官网使用了setTimeout的例子：

Deferred.connect()有两种重载：

- Deferred.connect(target,string)：把target上名为string指定名称的方法包装为Deferred对象。
- Deferred.connect(function,Object)：Object至少要有一个属性：target。以target为this调用function方法，返回的是包装后的方法，该方法返回Deferred对象。
给包装后的方法传递的参数，会传递给所指定的function。

```javascript
  var timeout = Deferred.connect(setTimeout, { target: window, ok: 0 });
  timeout(1).next(function () {
      alert('after 1 sec');
  });
  //另外一种传参
  var timeout = Deferred.connect(window, "setTimeout");
  timeout(1).next(function () {
      alert('after 1 sec');
  });
```

__Deferred.retry(retryCount, funcDeferred[ ,options])__
> 调用retryCount次funcDeffered方法（返回值类型为Deferred），直到触发成功事件或超过尝试次数为止。
options参数是一个对象，{wait:number}指定每次调用等待的秒数。
注意：Deferred.retry()并不会通过Deferred.define(obj)暴露给obj，它只能通过Deferred.retry()调用。

```javascript
        Deferred.define();
        Deferred.retry(3, function (number) {//Deferred.retry()方法是--i的方式实现的
            console.log(number);
            return Deferred.next(function () {
                if (number ^ 1)//当number!=1的时候抛出异常，表示失败，number==1的时候则让它成功
                    throw new Error('error');
            });
        }).next(function () {
            console.log('linkFly');//=>linkFly
        });

```

从源码这一行可以看到作者重点照顾的是这些方法：
```javascript
Deferred.methods = ["parallel", "wait", "next", "call", "loop", "repeat", "chain"];
```
其他的方法或许作者也觉得有点勉强吧，在Deferred.define()中默认都没有暴露那些API。

本来就想写jsDeferred的API，结果读完了源码...篇幅原因就不解读源码的，有兴趣的可以在下面的引用链接点过去看源码，不含注释未压缩版源码仅400行左右。

jsDeferred实现简单，代码通俗易懂，而API切割的非常容易上手，理念也容易理解，随着它的知名度提升进而让JavaScript异步编程备受瞩目，在阅读jsDeferred的时候，我总是在想这些前辈们当时苦苦思索走出JavaScript自留地的感觉，从现代的眼光来看，相比Promise，可能jsDeferred的实现甚至于略显青涩。这也让我想起了Robert Nyman前辈最初编写getElementByClassName()，然而在当时看来，足够艳惊世界。
随着JavaScript的兴起，现在的我们多喜欢四处扒来代码匆匆粘贴完成我们大多数的任务，逐渐的丢失了自己思考和挖掘代码的能力。值得庆幸的是JavaScript正在凝结自己的精华，未来迢长路远，与君共勉。

##参考和引用
> - [^_^肥仔John - JS魔法堂：jsDeferred源码剖析][11]
> - [司徒正美 - JavaScript框架设计：jsDeferred][12]
> - [jsDeferred][13]

<div class="l-author">
<div>作者：linkFly</div>
<div>原文：<a href="http://www.cnblogs.com/silin6/p/4288967.html">http://www.cnblogs.com/silin6/p/4288967.html</a></div>
<div>出处：<a href="http://www.cnblogs.com/silin6/">www.cnblogs.com/silin6/</a></div>
<div>声明：嘿！你都拷走上面那么一大段了，我觉得你应该也不介意顺便拷走这一小段，希望你能够在每一次的引用中都保留这一段声明，尊重作者的辛勤劳动成果，本文与博客园共享。</div>
</div>



  [1]: http://www.cnblogs.com/silin6/p/4288967.html
  [2]: http://cho45.stfuawsc.com/jsdeferred/
  [3]: https://github.com/cho45
  [4]: https://promisesaplus.com/
  [5]: http://segmentfault.com/blog/code/1190000002452115
  [6]: http://www.cnblogs.com/fsjohnhuang/
  [7]: http://www.cnblogs.com/fsjohnhuang/p/4141918.html#a427
  [8]: http://images.cnblogs.com/cnblogs_com/silin6/596820/o_jsDeferred%20Model.png
  [9]: http://cho45.stfuawsc.com/jsdeferred/doc/Deferred.html
  [10]: http://images.cnblogs.com/cnblogs_com/silin6/596820/o_Deferred.parallel.png
  [11]: http://www.cnblogs.com/fsjohnhuang/p/4141918.html
  [12]: http://www.cnblogs.com/rubylouvre/p/3658441nhuang/p/4141918.html
  [13]: http://cho45.stfuawsc.com/jsdeferred/