# JavaScript异步编程（1）-ECMAScript 6的Promise对象
---

<div class="l-index">
<p>
JavaScript的Callback机制深入人心。而JavaScript世界同样充斥的各种异步操作（异步IO、setTimeout等）。异步和Callback的搭载很容易就衍生"回调金字塔"。
</p>
<p>Deferred起源于Python，后来被CommonJS挖掘并发扬光大，得到了大名鼎鼎的Promise，并且已经纳入ECMAScript 6（JavaScript下一版本）。</p>
Promise/Deferred是当今最著名的异步模型，不仅强壮了JavaScript Event Loop（事件轮询）机制下异步代码的模型，同时增强了异步代码的可靠性。—— 匠者为之，以惠匠者。
</div>
> 本文内容如下：  
>  
> - Promise应对的问题
> - Promise的解决
> - ECMAScript 6 Promise
> - 参考和引用


##Promise应对的问题
JavaScript充斥着Callback，例如下面的代码：
```javascript
(function (num) {//从外面接收一个参数
    var writeName = function (callback) {
        if (num === 1)
            callback();
    }
    writeName(function () {//callback
        console.log("i'm linkFly");
    });
})(1);
```
把一个函数通过参数传递，那么这个函数叫做Callback（回调函数）。

JavaScript也充斥着异步操作——例如ajax。下面的代码就是一段异步操作：
```javascript
    var name;
    setTimeout(function () {
        name = 'linkFly';
    }, 1000);//1s后执行
    console.log(name);//输出undefined
```
这段代码的运行逻辑是这样的：
![Callback Demo][1]

我们的总是遇见这样的情况：一段代码异步执行，后续的代码却需要等待异步代码的，如果在异步代码之前执行，就会如上面的console.log(name)一样，输出undefined，这并不是我们想要的效果。

类似的情况总是发生在我们经常要使用的ajax上：
```javascript
    $.ajax({
        url: 'http://www.cnblogs.com/silin6/map',
        success: function (key) {
            //我们必须要等待这个ajax加载完成才能发起第二个ajax
            $.ajax({
                url: 'http://www.cnblogs.com/silin6/source/' + key,
                success: function (data) {
                    console.log("i'm linkFly");//后输出
                }
            });
        }
    });
    console.log('ok');//ok会在ajax之前执行
```
异步操作有点类似这一段代码被挂起，先执行后续的代码，直到异步得到响应（例如setTimeout要求的1s之后执行，ajax的服务器响应），这一段异步的代码才会执行。关于这一段异步代码的执行流程，请参阅JavaScript大名鼎鼎的：[Event Loop（事件轮询）][2]。



## Promise的解决

Promise优雅的修正了异步代码，我们使用Promise重写我们setTimeout的示例：
```javascript
    var name,
    p = new Promise(function (resolve) {
        setTimeout(function () {//异步回调
            resolve();
        }, 1000);//1s后执行
    });
    p.then(function () {
        name = 'linkFly';
        console.log(name);//linkFly
    }).then(function () {
        name = 'cnBlog';
        console.log(name);
    });
    //这段代码1s后会输出linkFly,cbBlog
```
我们先不要太过在意Promise对象的API，后续会讲解，我们只需要知道这段代码完成了和之前同样的工作。我们的console.log(name)正确的输出了linkFly，并且我们还神奇的输出了cnBlog。

或许你觉得这段代码实在繁琐，还不如setTimeout来的痛快，那么我们再来改写上面的ajax：
```javascript 
    var ajax = function (url) {
        //我们改写ajax，让它以Promise的方式工作
        return new Promise(function (resolve) {
            $.ajax({
                url: url,
                success: function (data) {
                    resolve(data);
                }
            });
        });
    };
    ajax('http://www.cnblogs.com/silin6/map')
        .then(function (key) {
            //我们得到key，发起第二条请求
            return ajax('http://www.cnblogs.com/silin6/source/' + key);
        })
        .then(function (data) {
            console.log(data);//这时候我们会接收到第二次ajax返回的数据
        });
```

或许它晦涩难懂，那么我们尝试用setTimeout来模拟这次的ajax，这个例子演示了Promise数据的传递，一如ajax：
```javascript
    var name,
        ajax = function (data) {
            return new Promise(function (resolve) {
                setTimeout(function () {//我们使用setTimeout模拟ajax
                    resolve(data);
                }, 1000);//1s后执行
            });
        };

    ajax('linkFly').then(function (name) {
        return ajax("i'm " + name);//模拟第二次ajax
    }).then(function (value) {
        //2s后，输出i'm linkFly
        console.log(value);
    });
```
  
上面的代码，从*代码语义*上达到了下面的流程：
  
![Promise][3]

我们仅观察代码就知道现在的它变得非常优雅，两次异步的代码被完美的抹平。但我们应该时刻谨记，Promise改变的是你异步的代码和编程思想，而并没有改变异步代码的执行——它是一种由卓越的编程思想所衍生的对象。
下面一张图演示了普通异步回调和Promise异步的区别，Promise实现的异步从代码运行上来说并无太大区别，但从编程思想上来说差异巨大。
![Promise][4]

##ECMAScript 6 Promise##
Promise对象代表了未来某个将要发生的事件（通常是一个异步操作），抹平了异步代码的金字塔，它从模型上解决了异步代码产生的"回调金字塔"。
Promise是ECMAScript 6规范内定义的，所以请使用现代浏览器测试，它的兼容性可以在[这里查看][5]。

__Promise.constructor__
Promise是一个对象，它的构造函数接收一个回调函数，这个回调函数参数有两个函数：分别在成功状态下执行和失败状态下执行，Promise有三个状态，分别为：等待态（Pending）、执行态（Fulfilled）和拒绝态（Rejected）。
```javascript
    var p = new Promise(function (resolve,reject) {
        console.log(arguments);
        //resolve表示成功状态下执行
        //reject表示失败状态下执行
    });
```
传递的这个回调函数，等同被Promise重新封装，并传递了两个参数回调，这两个参数用于驱动Promise数据的传递。resolve和reject本身承载着触发器的使命：
- 默认的Promise对象是*等待态（Pending）*。
- 调用resolve()表示这个Promise进入*执行态（Fulfilled）*
- 调用reject()表示这个promise()进入*拒绝态（Rejected）*
- Promise对象可以从等待状态下进入到执行态和拒绝态，并且无法回退。
- 而执行态和拒绝态不允许互相转换（例如执行态转换到拒绝态）。
  
__Promise.prototype.then__

生成的promise实例（如上面的变量p）拥有方法then()，then()方法是Promise对象的核心，它返回一个新的Promise对象，因此可以像jQuery一样链式操作，非常优雅。
Promise是双链的，所以then()方法接受两个参数，分别表示：
- _执行态（Fulfilled）_下执行的回调函数
- _拒绝态（Rejected）_下执行的回调函数。
   
```javascript
    p.then(function () {
      //我们返回一个promise
      return new Promise(function (resolve) {
            setTimeout(function () {
                resolve('resolve');
            }, 1000);//异步1s
        });
        
    }, function () {
        console.log('rejected');
    })  //链式回调
        .then(function (state) {
            console.log(state);//如果为执行态，输出resolve
        }, function (data) {
            console.log(data);//如果为拒绝态，输出undefined
        });;
```


then()方法的返回值由它相应状态下执行的函数决定：这个函数返回undefined，则then()方法构建一个默认的Promise对象，并且这个对象拥有then()方法所属的Promise对象的状态。
```javascript
    var p = new Promise(function (resolve) {
        resolve();//直接标志执行态
    }), temp;
    temp = p.then(function () {
        //传入执行态函数，不返回值
    });
    temp.then(function () {
        console.log('fulfilled');//拥有p的状态
    });

    console.log(temp === p);//默认构建的promise，但已经和p不是同一个对象，输出false
```

如果对应状态所执行的函数返回一个全新的Promise对象，则会覆盖掉当前Promise，代码如下：
```javascript
    var p = new Promise(function (resolve) {
        resolve();//直接标志执行态
    }), temp;
    temp = p.then(function () {
        //返回新的promise对象，和p的状态无关
        return new Promise(function (resolve, reject) {
            reject();//标志拒绝态
        });
    });
    temp.then(function () {
        console.log('fulfilled');
    }, function () {
        console.log('rejected');//输出
    });
```
即then()方法传递的进入的回调函数，如果返回promise对象，则then()方法返回这个promise对象，否则将默认构建一个新的promise对象，并继承调用then()方法的promise的状态。


我们应该清楚Promise的使命，抹平了异步代码的回调金字塔，我们会有很多依赖上一层异步的代码：
```javascript
    var url = 'http://www.cnblogs.com/silin6/';
    ajax(url, function (data) {
        ajax(url + data, function (data2) {
            ajax(url + data2, function (data3) {
                ajax(url + data3, function () {
                    //回调金字塔
                });
            });
        });
    });
```

使用Promise则抹平了代码：
```javascript
    promise.then(function (data) {
        return ajax(url + data);
    }).then(function (data2) {
        return ajax(url + data2);
    }).then(function (data3) {
        return ajax(url + data3);
    }).then(function (data) {
        //扁平化代码
    });
```

Promise还有更多更强大的API。但本文的目的旨在让大家感受到Promise的魅力，而并非讲解Promise对象自身的API，关于Promise其他辅助实现API请查阅本文最下方的引用章节，Promise其他API如下：

- _Promise.prototype.catch()_：用于指定发生错误时的回调函数（捕获异常），并具有冒泡性质。
- _Promise.all()_，_Promise.race()_：Promise.all方法用于将多个Promise实例，包装成一个新的Promise实例。
- _Promise.resolve()_，_Promise.reject()_:将现有对象转为Promise对象。

希望大家一点点的接受Promise，所以没有讲太多，我们对于Promise的理解不应该仅仅是一个异步模型，我们更关注应该是Promise/Deferred的编程思想，所以后续几章会逐渐深入讲解Promise的前生今世。

##参考和引用##

> - [ECMAScript 6 入门 - Promise对象][6]
> - [Promise/A+规范][7]
> - [JavaScript框架设计-第12章 异步处理][8]
> - [Promise启示录][9]
  
<div class="l-author">
<div>作者：linkFly</div>
<div>原文：<a href="http://www.cnblogs.com/silin6/p/4288967.html">http://www.cnblogs.com/silin6/p/4288967.html</a></div>
<div>出处：<a href="http://www.cnblogs.com/silin6/">www.cnblogs.com/silin6/</a></div>
<div>声明：嘿！你都拷走上面那么一大段了，我觉得你应该也不介意顺便拷走这一小段，希望你能够在每一次的引用中都保留这一段声明，尊重作者的辛勤劳动成果，本文与博客园共享。</div>
</div>


  [1]: http://images.cnblogs.com/cnblogs_com/silin6/596820/o_promiseError.png
  [2]: http://www.ruanyifeng.com/blog/2013/10/event_loop.html
  [3]: http://images.cnblogs.com/cnblogs_com/silin6/596820/o_Promise.png
  [4]: http://images.cnblogs.com/cnblogs_com/silin6/596820/o_PromiseAndCallback.png
  [5]: http://caniuse.com/#search=Promise
  [6]: http://es6.ruanyifeng.com/#docs/promise
  [7]: http://www.ituring.com.cn/article/66566#
  [8]: http://www.cnblogs.com/rubylouvre/p/3658441.html
  [9]: https://www.dmfeel.com/post/536799f91f1bf49646000001