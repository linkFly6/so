# JavaScript异步编程（1）-ECMAScript 6的Promise对象
---

<div class="l-index">
JavaScript的Callback机制深入人心。而JavaScript世界同样充斥的各种异步操作（异步IO、setTimeout等）。异步和Callback的搭载很容易就衍生"回调金字塔"。而Deferred起源于Python，后来被CommonJS挖掘并发扬光大，得到了大名鼎鼎的Promise，并且已经纳入ECMAScript 6（JavaScript下一版本）。Promise/Deferred是当今最著名的异步模型，不仅强壮了JavaScript Event Loop（事件轮询）机制下异步代码的模型，同时增强了异步代码的可靠性。匠者为之，以惠匠者。
</div>
> 本文内容如下：  
>  
> - Promise应对的问题
> - Promise的解决
> - ECMAScript 6 Promise
> - 结语


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
异步操作有点类似这一段代码被挂起，先执行后续的代码，直到异步得到响应（例如setTimeout要求的1s之后执行，ajax的服务器响应），这一段异步的代码才会执行。关于这一段异步代码的执行流程，请参阅JavaScript大名鼎鼎的：[Event Loop（事件轮询）][1]。



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

我们仅观察代码就知道现在的它变得非常优雅，两次异步的代码被完美的抹平，下面我们来了解这个神奇的Promise对象。

#ECMAScript 6 Promise
Promise对象代表了未来某个将要发生的事件（通常是一个异步操作），抹平了异步代码的金字塔，它从模型上解决了异步代码产生的"回调金字塔"。
Promise是ECMAScript 6规范内定义的，所以请使用现代浏览器测试，它的兼容性可以在[这里查看][2]。

__Promise.constructor__
Promise是一个对象，它的构造函数接收一个回调函数，这个回调函数参数有两个函数：分别在成功状态下执行和失败状态下执行，Promise有三个状态，分别为：等待态（Pending）、执行态（Fulfilled）和拒绝态（Rejected）。
```javascript
    var p = new Promise(function (resolve,reject) {
        console.log(arguments);
        //resolve表示成功状态下执行
        //reject表示失败状态下执行
    });
```
传递的这个回调函数，等同被Promise重新封装，并传递了两个参数回调，这两个参数用于驱动Promise数据的传递。
resolve和reject本身承载着触发器的使命，默认的Promise对象是_等待态（Pending）_，调用resolve()表示这个Promise进入_执行态（Fulfilled）_，reject()表示这个promise()进入_拒绝态（Rejected）_，Promise对象可以从等待状态下进入到执行态和拒绝态，并且无法回退，而执行态和拒绝态不允许互相转换（例如执行态转换到拒绝态）。

__Promise.prototype.then__
生成的promise实例（如上面的变量p）拥有方法then()，then()方法是Promise对象的核心，它返回一个新的Promise对象，因此可以像jQuery一样链式操作，非常优雅。
then()方法接受两个参数：分别表示_执行态（Fulfilled）_下执行的回调函数和_拒绝态（Rejected）_下执行的回调函数。
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

Promise还有更多更强大的API，但本文的目的旨在让大家感受到Promise的魅力，而并非讲解Promise对象自身的API。所以后面的一些API会一带而过，我们更关注应该是Promise的思想和精神。详细的API请查阅本文最下方的引用章节。


希望大家一点点的接受Promise，所以没有讲太多。后续几章会逐渐深入讲解Promise的前生今世。


  [1]: http://www.ruanyifeng.com/blog/2013/10/event_loop.html
  [2]: http://caniuse.com/#search=Promise