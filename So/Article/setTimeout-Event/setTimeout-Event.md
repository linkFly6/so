# JavaScript下的setTimeout(fn,0)意味着什么？

标签（空格分隔）： Eventloop

---

<div class="l-index">
<p>
近期在研究异步编程的我对于setTimeout之类的东西异常敏感。在SegmentFault上看到了一个问题《关于SetTimeout时间设为0时》：提问者读了一篇文章，原文解释setTimeout延迟时间为0时会发生的事情，提问者提出了几个文章中的几个疑点。读了那篇文章之后发现原文的作者对于setTimeout的理解和自己的认知有点出入，于是编写了相关测试的代码以求答案。最终编写了这篇文章。
</p>
</div>
> 本文内容如下：  
>  
> - 起因
> - 单线程的JavaScript
> - setTimeout背后意味着什么
> - 参考和引用

> __JavaScript - 前端开发交流群：377786580__

##起因
上午在SegmentFault上看到了这个问题《[关于SetTimeout 时间设为0时][1]》（注：SegmentFault正在调整备案，如不能访问，请点击[这里][2]），原提问者注明了问题来源：《[JS setTimeout延迟时间为0的详解][3]》。这个问题来源也是转载的，我后来找到了[出处][4]。
在问题来源的那篇的文章中（后者），讲述了JS是单线程引擎：它把任务放到队列中，不会同步去执行，必须在完成一个任务后才开始另外一个任务。
而后，转载的那篇文章列出并补充了原文的栗子：
```html
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>setTimeout</title>
    <script type="text/javascript">
        function get(id) {
            return document.getElementById(id);
        }
        window.onload = function () {
            //第一个例子：未使用setTimeout
            get('makeinput').onmousedown = function () {
                var input = document.createElement('input');
                input.setAttribute('type', 'text');
                input.setAttribute('value', 'test1');
                get('inpwrapper').appendChild(input);
                input.focus();
                input.select();
            }
            //第二个例子：使用setTimeout
            get('makeinput2').onmousedown = function () {
                var input = document.createElement('input');
                input.setAttribute('type', 'text');
                input.setAttribute('value', 'test1');
                get('inpwrapper2').appendChild(input);
                //setTimeout
                setTimeout(function () {
                    input.focus();
                    input.select();
                }, 0);
            }
            //第三个例子，onkeypress输入的时候少了一个值
            get('input').onkeypress = function () {
                get('preview').innerHTML = this.value;
            }
        }
    </script>
</head>
<body>
    <h1><code>setTimeout</code></h1>
    <h2>1、未使用 <code>setTimeout</code></h2>
    <button id="makeinput">生成 input</button>
    <p id="inpwrapper"></p>


    <h2>2、使用 <code>setTimeout</code></h2>
    <button id="makeinput2">生成 input</button>
    <p id="inpwrapper2"></p>


    <h2>3、另一个例子</h2>
    <p>
        <input type="text" id="input" value="" /><span id="preview"></span>
    </p>
</body>
</html>

```
代码运行实例请戳[这里][5]。
原文中有这么一段话，描述的有点抽象：
>  
JavaScript引擎在执行onmousedown时，由于没有多线程的同步执行，不可能同时去处理刚创建元素的focus 和select方法，由于这两个方法都不在队列中，在完成onmousedown后，JavaScript 引擎已经丢弃了这两个任务，正如第一种情况。而在第二种情况中，由于setTimeout可以把任务从某个队列中跳脱成为新队列，因而能够得到期望的结果。 

我看到这里就觉得非常不对劲了。因为按照这种任务会被丢弃的说法，那么只要在事件触发的函数中再触发其他的事件都会被丢弃，浏览器是绝对不会这么做的，于是我编写了测试代码：
```javascript
    window.onload = function () {
        //第一个例子：未使用setTimeout
        get('makeinput').onmousedown = function () {
            var input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.setAttribute('value', 'test1');
            get('inpwrapper').appendChild(input);
            //按照文中的理论，这里的click不会被触发，但它却成功触发了
            get('inpwrapper').click();//触发了inpwrapper的onclick事件
        }
        get('inpwrapper').onclick = function () {
            alert('linkFly');
        };
    }
```
下面的onclick()最终是执行了：弹出了"linkFly"。

而在转载的文中为了引人深思，又提出了第三个例子：
> 
在此，你可以看看例子 3，它的任务是实时更新输入的文本，现在请试试，你会发现预览区域总是落后一拍，比如你输 a, 预览区并没有出现 a, 在紧接输入b时，a才不慌不忙地出现。

而文中最后留给大家的思考的问题，解决方案就是使用setTimeout再次调整浏览器的代码任务运行队列。
```javascript
    var domInput = get('input');
    domInput.onkeypress = function () {
        setTimeout(function () {
            //第三个例子的问题就这样就会被解决
            get('preview').innerHTML = domInput.value;
        })
    }
```
原文和转载的文章中都对setTimeout(fn,0)进行了思考，但原文指出的问题本质漏洞百出，所以才出了这篇文章，我们的正文，现在开始。


##单线程的JavaScript
首先我们来看浏览器下的JavaScript：
浏览器的内核是多线程的，它们在内核制控下相互配合以保持同步，一个浏览器至少实现三个常驻线程：javascript引擎线程，GUI渲染线程，浏览器事件触发线程。
> - javascript引擎是基于事件驱动单线程执行的，JS引擎一直等待着任务队列中任务的到来，然后加以处理，浏览器无论什么时候都只有一个JS线程在运行JS程序。
> - GUI渲染线程负责渲染浏览器界面，当界面需要重绘（Repaint）或由于某种操作引发回流(reflow)时,该线程就会执行。但需要注意 GUI渲染线程与JS引擎是互斥的，当JS引擎执行时GUI线程会被挂起，GUI更新会被保存在一个队列中等到JS引擎空闲时立即被执行。
> - 事件触发线程，当一个事件被触发时该线程会把事件添加到待处理队列的队尾，等待JS引擎的处理。这些事件可来自JavaScript引擎当前执行的代码块如setTimeOut、也可来自浏览器内核的其他线程如鼠标点击、AJAX异步请求等，但由于JS的单线程关系所有这些事件都得排队等待JS引擎处理。（当线程中没有执行任何同步代码的前提下才会执行异步代码）

js的单线程在这一段面试代码中尤为明显（理解即可，请不要尝试...浏览器会假死的）：
```javascript
        var isEnd = true;
        window.setTimeout(function () {
            isEnd = false;//1s后，改变isEnd的值
        }, 1000);
        //这个while永远的占用了js线程，所以setTimeout里面的函数永远不会执行
        while (isEnd);
        //alert也永远不会弹出
        alert('end');
```
在我工作中对js的认识，个人认为js的任务单位是函数。即，一个函数表示着一个任务，这个函数没有执行结束，则在浏览器中当前的任务即没有结束。
上面的代码中，当前任务因为while的执行而造成永远无法执行，所以后面的setTimeout也永远不会被执行。它在浏览器的任务队列中如图所示：

![Browser Event][6]

##setTimeout背后意味着什么
这篇文章一直在使用setTimeout为我们展现和理解js单线程的设计，只是它错误的使用了Event来进行演示，并过度解读了Event。
这里原文和转载的文章忽略了这些基础的事件触发，而且也偏偏挑了两套本身设计就比较复杂的API：onmouseXXX系和onkeyXXX系。

onKeyXXX系的API触发顺序如图：

![onKeyXXX][7]


而我个人所理解它们对应的功能：
> - onkeydown - 主要获取和处理当前按下按键，例如按下Enter后进行提交。在这一层，并没有更新相关DOM元素的值。
> - onkeypress - 主要获取和处理长按键，因为onkeypress在长按键盘的情况下会反复触发直到释放，这里并没有更新相关DOM元素的值，值得注意的是：keypress之后才会更新值，所以在长按键盘反复触发onkeypress事件的时候，后一个触发的onkeypress能得到上一个onkeypress的值。所以出现了onkeypress每次取值都会是上一次的值而不是最新值。
> - onkeyup - 触发onkeyup的DOM元素的值在这里已经更新，可以拿到最新的值，所以这里主要处理相关DOM元素的值。

流程就是上面的图画的那样：
> onkeydown =>  onkeypress => onkeyup

使用了setTimeout之后，流程应该是下面这样子的：
> onkeydown => onkeypress => function => onkeyup

使用setTimeout(fn,0)之后，在onkeypress后面插入了我们的函数function。上面所说，浏览器在onkeypress之后就会更新相关DOM元素的状态（input[type=text]的value），所以我们的function里面可以拿到最新的值。
所以我们在onkeypress里面挂起setTimeout能拿到正确的值，下面的代码可以测试使用setTimeout(fn,0)之后的流程：
```javascript
    window.onload = function () {
        var domInput = get('input'), view = get('preview');
        //onkeypress兼容性和说明：http://www.w3school.com.cn/jsref/jsref_events.asp
        domInput.onkeypress = function () {
            setTimeout(function () {
                //这个函数在keypress之后，keyup之前执行
                console.log('linkFly');
            });
        };
        domInput.onkeyup = function () {
            console.log('up');
        };
    };
```

然后我们再来谈谈原代码中的示例1和示例2，示例1和示例2的区别在这里：
```javascript
        //示例1
        input.focus();
        input.select();
        
        //示例2
        setTimeout(function () {
            input.focus();
            input.select();
        }, 0);
```
原文章中说示例1的focus()和select()在onmousedown事件中被丢弃，从而导致了没有选中，但原文的作者忽略了他注册的事件是：onmousedown。
我们暂且不讨论onmouseXXX系的其他API，我们仅关注和点击相关的，它们的执行顺序是：
> - mousedown - 鼠标按钮按下
> - mouseup - 鼠标按钮释放
> - click - 完成单击

我们在onmousedown里面新建了input，并且选中input的值（调用了input.focus(),input.select()）。
那么为什么没有被选中呢？这样，我们来做一次测试，看看我们的onfocus到底是被丢弃了，还是触发了。我们把原文的代码进行改写：
```javascript
    window.onload = function () {
        var makeBtn = get('makeinput');
        //观察onmouseXXX系完成整个单击的顺序
        makeBtn.onmousedown = function (e) {
            console.log(e.type);
            var input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.setAttribute('value', 'test1');
            get('inpwrapper').appendChild(input);
            input.onfocus = function () {//观察我们新生成的input什么时候获取焦点的，或者它有没有像原文作者说的那样被丢弃了
                console.info('input focus');
            };
            input.focus();
            input.select();
        }
        makeBtn.onclick = function (e) {
            console.log(e.type);
        };
        makeBtn.onmouseup = function (e) {
            console.log(e.type);
        };
        makeBtn.onfocus = function () {//观察我们生成按钮什么时候获取焦点的
            console.log('makeBtn focus');
        }
    };
```
代码运行的结果是这样的：
![onmouseXXX & focus][8]



我们的input focus执行了——那么它为什么没有获取到焦点呢？我们再看看后面执行的函数：我们点击的按钮，在mousedown之后，才获得焦点，也就是说：我们的input本来已经得到了focus()，但在onmousedown之后，我们点击的按钮才迟迟触发了自己的onfocus()，导致我们的input被覆盖。
我们再加上setTimeout进行测试：
```javascript
    window.onload = function () {
        var makeBtn = get('makeinput');
        makeBtn.onmousedown = function (e) {
            console.log(e.type);
            var input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.setAttribute('value', 'test1');
            get('inpwrapper').appendChild(input);
            input.onfocus = function () {
                console.info('input focus');
            };
            //我们加上setTimeout，看看会发生什么
            setTimeout(function () {
                input.focus();
                input.select();
            });
        }
        makeBtn.onclick = function (e) {
            console.log(e.type);
        };
        makeBtn.onmouseup = function (e) {
            console.log(e.type);
        };
        makeBtn.onfocus = function () {
            console.log('makeBtn focus');
        }
    };
```

执行结果是这样：
![onmouseXXX and settimeout][9]

可以看见当我们点击"生成"按钮的时候，按钮的focus正确的执行了，然后才执行了input focus。
在示例1中，我们在onmousedown()中执行了input.focus()导致input得到焦点，而onmousedown之后，我们点击的按钮才迟迟得到了自己的焦点，造成了我们input刚拿到手还没焐热的焦点被转移。
而示例2中的代码，我们延迟了焦点，当按钮获得焦点之后，我们的input再把焦点抢过来，所以，使用setTimeout(fn,0)之后，我们的input可以得到焦点并选中文本。
这里值得思考的focus()的执行时机，根据这次测试观察，发现focus事件好像挂载在mousedown之内的最后面，而不是直接挂在mousedown的后面。它和mousedown仿佛是一体的。
我们使用setTimeout之前的任务流程是这样的（->表示在上一个任务中，=>表示在上一个任务后）：
> onmousedown -> onmousedown中执行了input.focus() -> button.onfocus => onmouseup => onclick

![onmouseXXX事件流程][10]


而我们使用了setTimeout之后的任务流程是这样的：
> onmousedown -> button.onfocus => input.focus => onmouseup => onclick

![onmouseXXX+setTimeout事件流程][11]

而从上面的流程上我们得知了另外的消息，我们还可以把input.focus挂在mouseup和click下，因为在这些事件之前，我们的按钮已经得到过焦点了，不会再抢我们的焦点了。
```javascript
        makeBtn.click = function (e) {
            console.log(e.type);
            var input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.setAttribute('value', 'test1');
            get('inpwrapper').appendChild(input);
            input.onfocus = function () {//观察我们新生成的input什么时候获取焦点的
                console.info('input focus');
            };
            input.focus();
            input.select();
        }
```

我们应该认识到，利用setTimeout(fn,0)的特性，可以帮助我们在某些极端场景下，修正浏览器的下一个任务。

到了这里，我们已经可以否定原文所说的："JavaScript引擎已经丢弃了这两个任务"。
我仍然相信，浏览器是爱我们的（除了IE6和移动端一些XXOO的浏览器！！！！）浏览器并不会平白无故的丢弃我们辛劳写下的代码，多数时候，只是因为我们没有看见背后的真相而已。

当我们踏进计算机的世界写下"hello world"的时候就应该坚信，这个二进制的世界里，永远存在真相。


##参考和引用
> - [JavaScript异步机制][12]
> - [什么是 Event Loop][13]
> - [javascript线程解释][14]

> __JavaScript - 前端开发交流群：377786580__

<div class="l-author">
<div>作者：linkFly</div>
<div>原文：<a href="http://www.cnblogs.com/silin6/p/4333999.html">http://www.cnblogs.com/silin6/p/4333999.html</a></div>
<div>出处：<a href="http://www.cnblogs.com/silin6/">www.cnblogs.com/silin6/</a></div>
<div>声明：嘿！你都拷走上面那么一大段了，我觉得你应该也不介意顺便拷走这一小段，希望你能够在每一次的引用中都保留这一段声明，尊重作者的辛勤劳动成果，本文与博客园共享。</div>
</div>


  [1]: http://segmentfault.net/q/1010000002590298
  [2]: http://segmentfault.com/q/1010000002590298
  [3]: http://blog.csdn.net/lsk_jd/article/details/6080772
  [4]: http://www.cnblogs.com/xieex/archive/2008/07/11/1241137.html
  [5]: http://runjs.cn/detail/uf2rofq7
  [6]: http://images.cnblogs.com/cnblogs_com/silin6/596820/o_Browser%20Event.png
  [7]: http://images.cnblogs.com/cnblogs_com/silin6/596820/o_onKeyXXX.png
  [8]: http://images.cnblogs.com/cnblogs_com/silin6/596820/o_onmouseXXandFocus.png
  [9]: http://images.cnblogs.com/cnblogs_com/silin6/596820/o_onmouseandsettimeout.png
  [10]: http://images.cnblogs.com/cnblogs_com/silin6/596820/o_onmouseXXX-event.png
  [11]: http://images.cnblogs.com/cnblogs_com/silin6/596820/o_onmouseXXX-event-settimeout.png
  [12]: http://www.cnblogs.com/zhaodongyu/p/3922961.html
  [13]: http://www.ruanyifeng.com/blog/2013/10/event_loop://www.cnblogs.com/zhaodongyu/p/3922961.html
  [14]: http://blog.csdn.net/kongls08/article/details/6996518