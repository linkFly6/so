﻿# DeferJsonp ![license|MIT][1]


简单精致的web jsonp的异步流程控制库。

## 异步控制
控制jsonp的异步流程，传统的jsonp：

过去的代码：
```javascript
    window.demo1 = function (data) {//jsonp请求回调函数
        window.demo2 = function (data2) {
            window.demo3 = function (data3) {
                console.log(data, data2, data3);
            };
            writeJsonp('/test?callback=demo3')
        };
        writeJsonp('/test?callback=demo1');
    };
    writeJsonp('/test?callback=demo1');//发起jsonp请求
```

现在：
```javascript
    var defer = new DeferJsonp;
    defer.load('/test?callback=demo1')
            .load('/test?callback=demo2')
            .load('/test?callback=demo3', function (data3, data2, data) {
                console.log(data, data2, data3);
            });
```

> 和**Promise**并不相同，Promise强调等待上一个Promise对象的结果，而DeferJsonp是在上一个DeferJsonp请求的同时并行请求自己，在返回结果的时候按照顺序执行。

最大化利用浏览器http线程并行，并维持每一个jsonp的执行顺序。

传统的jsonp进行两次请求，共计约2s：
![jsonp][2]

DeferJsonp，共计约1s：
![DeferJsonp][3]

更多请参考[延伸][4]。

## API
DeferJsonp目前仅一个API。
### DeferJsonp.prototype.load(url,done[,fail,time])
>发送一个jsonp请求(url)，设置成功后执行的函数(done)，失败后执行的函数(fail，可略)，超时时间(time，可略)。

```javascript
    var defer = new DeferJsonp;
    defer.load('/test?callback=demo1', function () {
        return true;//done
    }, function () {
        return false;//fail
    }, 1000)
    .load('/test?callback=demo2', function (data) {
        return data;
    })
    .load('/test?callback=demo3', function (data3, data2, data) {
        console.log(data, data2, data3);
    });
```

## 延伸
在[DESCRIPTION][5]中详细描述了DeferJsonp的工作模型和高强度测试。

## 计划
根据DeferJsonp的需求量，后期**可能**提供这些API：

 1. DeferJsonp.prototype.done(callback) - 多次委托成功后执行的回调函数
 2. DeferJsonp.prototype.fail(callback) - 多次委托失败后执行的回调函数
 3. DeferJsonp.prototype.ajax(options) - 支持ajax
 4. 兼容&lt;IE9的浏览器

 
## License

    The MIT License (MIT)

    Copyright (c) 2004 Kohsuke Kawaguchi, Sun Microsystems Inc., and a number of other contributors. 

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.


  [1]: https://camo.githubusercontent.com/11b46a2fb2858bbfcaf16cd73aa05f851230d0f5/687474703a2f2f696d672e736869656c64732e696f2f62616467652f6c6963656e73652d4d49542d79656c6c6f77677265656e2e737667
  [2]: https://github.com/linkFly6/linkfly.so/tree/master/LinkFLy/Code/DeferJsonp/images/jsonp.png
  [3]: https://github.com/linkFly6/linkfly.so/tree/master/LinkFLy/Code/DeferJsonp/images/deferJsonp.png
  [4]: https://github.com/linkFly6/linkfly.so/tree/master/LinkFLy/Code/DeferJsonp
  [5]: https://github.com/linkFly6/linkfly.so/tree/master/LinkFLy/Code/DeferJsonp/DESCRIPTION.md