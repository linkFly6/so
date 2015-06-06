# JavaScript异步编程（2）- 先驱者：jsDeferred

<div class="l-index">
<p>
JavaScript当前有众多实现异步编程的方式，最为耀眼的就是ES 6规范中的Promise，它来自于CommonJS小组的努力：Promise/A+规范。
</p>
<p>研究javascript的异步编程，jsDeferred也是有必要探索的：因为Promise/A+规范的制定基本上是鉴定在jsDeferred上，它是javascript异步编程中里程碑式的作品。jsDeferred自身的实现也是非常有意思的。</p>
<p>本文将探讨项目jsDeferred的项目模型，带我们感受一个不一样的异步编程体验和实现。</p>
</div>
> 本文内容如下：  
>  
> - jsDeferred和Promise/A+
> - jsDeferred模型
> - jsDeferred API
> - 参考和引用


##jsDeferred和Promise/A+
[jsDeferred][1]是日本javascript高手[geek cho45][2]受MochiKit.Async.Deferred模块启发在2007年开发（2007年就玩这个了...(/ □ \)）的一个异步执行类库。我们将jsDeferred的原型和[Promise/A+规范][3]（[译文戳这里][4]）进行对比（来自[@^_^肥仔John][5]的《[JS魔法堂：jsDeferred源码剖析][6]》）：

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

##jsDeferred模型
下面一张图演示了jsDeferred的模型，值得注意的是jsDeferred第一次调用next有着不同的处理。


jsDeferred在全局状态下第一次调用next()的时候，会立即执行这个回调函数，第一次调用next()。
jsDeferred的API众多，因为jsDeferred把所有的异步问题都划分到了最小的粒子，这些API相互进行组合则可以完成逆天的异步能力，在后续的API示例中可以看到jsDeferred API组合从而完成强大的异步编程。

##jsDeferred API
当我第一次知道jsDeferred API有一坨的时候，其实我是，是拒绝的。我跟你讲，我拒绝，因为其实我觉得这根本要不了一坨，但你跟我讲，jsDeferred内部会加特技，是假的一坨，是表面看起来一坨。然后加了特技之后，jsDeferred duang～duang～duang～

貌似没有看到过jsDeferred的详细的中文API文档（[原API文档][7]），就这里顺便整理一份简单的出来（虽然它的API已经足够通俗易懂了）。值得一提的是官网的API引导例子非常的生动和实用：

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

parallel()进行了3次重载：

- parallel(fn[ ,fn]*)：传入Function类型的参数，允许多个
- parallel(Array)：给定一个由Function组成的Array类型的参数
- parallel(Object)：给定一个对象，由对象中所有可枚举的Function构建Deferred



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

其实这个方法配合Deferred自身的逻辑有点蛋疼，个人觉得和connect()一样属于略有败笔之作，下面的代码演示了Deferred静态方法和实例方法的不同之处（实例方法后续会说）：
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


        //下面这种方式仅执行一次，且相当于什么事情也没有发生
        Deferred.retry(3, function (number) {
            var deferred = Deferred();//通过new一个Deferred实现
            console.info('new Deferred(): ' + number);//仅输出这里
            return deferred.next(function () {
                if (number ^ 1)
                    throw new Error('error');
            });
        }).next(function () {
            console.log('linkFly');//=>linkFly
        }).error(function () {
            console.log('normal');
        });
```
是不是觉得很奇怪。参数funcDeferred函数要求返回Deferred，但我们在下面一种的示例中返回了Deferred对象却什么也不输出，甚至连Error都没有。
原因在于Deferred.next()和Deferred.prototype.next()实现本质并不同，这里的如果详细说下来又是一大篇jsDeferred的异步模型啊之类的东西，为了篇幅就不提了，有兴趣的可以去看下源码感受下。
Deferred.retry()和Deferred.connect()方法一样，略显败笔。

从源码这一行可以看到作者重点照顾的是这些方法：
```javascript
Deferred.methods = ["parallel", "wait", "next", "call", "loop", "repeat", "chain"];
```
其他的方法或许作者也觉得有点勉强吧，在Deferred.define()中默认都没有暴露那些API。

本来就想写jsDeferred的API，结果读完了源码...

##参考和引用



  [1]: http://cho45.stfuawsc.com/jsdeferred/
  [2]: https://github.com/cho45
  [3]: https://promisesaplus.com/
  [4]: http://segmentfault.com/blog/code/1190000002452115
  [5]: http://www.cnblogs.com/fsjohnhuang/
  [6]: http://www.cnblogs.com/fsjohnhuang/p/4141918.html#a427
  [7]: http://cho45.stfuawsc.com/jsdeferred/doc/Deferred.html