# 编写更加稳定/可读的javascript代码 #
<div class="l-index">
每个人都有自己的编程风格，也无可避免的要去感受别人的编程风格——修改别人的代码。"修改别人的代码"对于我们来说的一件很痛苦的事情。因为有些代码并不是那么容易阅读、可维护的，让另一个人来修改别人的代码，或许最终只会修改一个变量，调整一个函数的调用时机，却需要花上1个小时甚至更多的时间来阅读、缕清别人的代码。本文一步步带你重构一段获取位置的"组件"——提升你的javascript代码的可读性和稳定性。
</div>
> 本文内容如下：  
>  
> - 分离你的javascript代码
> - 函数不应该过分依赖外部环境
> - 语义化和复用
> - 组件应该关注逻辑，行为只是封装
> - 形成自己的风格的代码

## 分离你的javascript代码 ##
下面一段代码演示了难以阅读/修改的代码：  
```javascript
(function (window, namespace) {
    var $ = window.jQuery;
    window[namespace] = function (targetId, textId) {
        //一个尝试复用的获取位置的"组件"
        var $target = $('#' + targetId),//按钮
            $text = $('#' + textId);//显示文本
        $target.on('click', function () {
            $text.html('获取中');
            var data = '北京市';//balabala很多逻辑，伪代码，获取得到位置中
            if (data) {
                $text.html(data);
            } else
                $text.html('获取失败');
        });
    }
})(window, 'linkFly');

```
这一段代码，我们暂且认可它已经构成一个"组件"。  
上面的代码就是典型的一个方法搞定所有事情，一旦填充上内部的逻辑就会变得生活不能自理，而一旦增加需求，例如获取位置返回的数据格式需要加工，那么就要去里面寻找处理数据的代码然后修改。
  
我们分离一下逻辑，得到代码如下：
```javascript
(function (window, namespace) {
    var $ = window.jQuery,
        $target,
        $text,
        states= ['获取中', '获取失败'];
    function done(address) {//获取位置成功
        $text.html(address);
    }
    function fail() {
        $text.html(states[1]);
    }
    function checkData(data) {
        //检查位置信息是否正确
        return !!data;
    }
    function loadPosition() {
        var data = '北京市';//获取位置中
        if (checkData(data)) {
            done(data);
        } else
            fail();
    }
    var init = function () {
        $target.on('click', function () {
            $text.html(states[0]);
            loadPosition();
        });
    };
    window[namespace] = function (targetId, textId) {
        $target = $('#' + targetId);
        $text = $('#' + textId);
        initData();
        setData();
    }
})(window, 'linkFly');
```
## 函数不应该过分依赖外部环境 ##

上面的代码中，我们已经把整个组件，切割成了各种函数（注意这里我说的是函数，不是方法），这里常出现一个新的问题：函数过分依赖不可控的变量。

变量*$target*和*$text*身为环境中的全局变量，从组件初始化便赋值，而我们切割后的代码大多数的操作方法都依赖$text，尤其是$text和*done()*、*fail()*之间暧昧的关系，一旦$text相关的结构、逻辑改变，那么我们的代码将会进行不小的改动。  

和页面/DOM相关的都是不可信赖的（例如$target和$text），一旦页面结构发生改变，它的行为很大程度上也会随之改变。而函数也不应该依赖外部的环境。
在不可控的变量上，我们应该解开函数和依赖变量上的关系，让函数变得更加专注自己区域的逻辑，更加的纯粹。简单的说：函数所依赖的外部变量，都应该通过参数传递到函数内部。
新的代码如下：

```javascript
(function (window, namespace) {
    var $ = window.jQuery;
    //检查位置信息是否正确
    function checkData(data) {
        return !!data;
    }
    //获取位置中
    function loadPosition(done, fail) {
        var data = '北京市';//获取位置中
        if (checkData(data)) {
            done(data);
        } else
            fail();
    }
    window[namespace] = function (targetId, textId) {
       var  $target = $('#' + targetId),
            $text = $('#' + textId);
        var states = ['获取中', '获取失败'];
        $target.on('click', function () {
            $text.html(states[0]);
            loadPosition(function (address) {//获取位置成功
                $text.html(address);
            }, function () {//获取位置失败
                $text.html(states[1]);
            });
        });
    }
})(window, 'linkFly');
```

## 语义化和复用 ##

变量*states*是一个数组，它描述的行为难以阅读，每次看到*states&#91;0&#93;*都有一种分分钟想捏死原作者的冲动，因为我们总是要记住变量*states*的值，在代码上，我们应该尽可能让它可以很好的被阅读。

另外，上面的代码中$text.html就是典型的代码重复，我们再一次的修改代码，请注意这一次修改的代码中，我们所抽离的*changeStateText()*的代码位置，它并没有被提升到上一层环境中（也就是整个大闭包的环境）。

```javascript
(function (window, namespace) {
    var $ = window.jQuery;
    function checkData(data) {
        return !!data;
    }
    function loadPosition(done, fail) {
        var data = '北京市';//获取位置中
        if (checkData(data)) {
            done(data);
        } else
            fail();
    }
    window[namespace] = function (targetId, textId) {
        var $target = $('#' + targetId),
            $text = $('#' + textId),
            changeEnum = { LOADING: '获取中', FAIL: '获取失败' },
            changeStateText = function (text) {
                $text.html(text);
            };
        $target.on('click', function () {
            changeStateText(changeEnum.LOADING);
            loadPosition(function (address) {
                changeStateText(address);
            }, function () {
                changeStateText(changeEnum.FAIL);
            });
        });
    }
})(window, 'linkFly');
```

提及语义化，我们必须要知道当前整个代码的逻辑和语义：  

在这整个组件中，所有的函数模块可以分为：*工具*和*工具提供者*。

上一层环境（整个大闭包）在我们的业务中扮演着*工具*的身份，它的任务是缔造一套和获取位置逻辑相关的工具，而在*window&#91;namespace&#93;)*函数中，则是*工具提供者*的身份，它是唯一的入口，负责提供组件完整的业务给工具的使用者。
这里的*$text.html()*在逻辑上并不属于工具，而是属于工具提供者使用工具后所得到的反馈，所以*changeStateText()*函数置于工具提供者window&#91;namespace&#93;()中。


## 组件应该关注逻辑，行为只是封装 ##

到此为止，我们分离了函数，并让这个组件拥有了良好的语义。但这时候来了新的需求：当没有获取到位置的时候，需要进行一些其他的操作。这时候会发现，我们需要*window&#91;namespace&#93;()*上加上新的参数。
当我们加上新的参数之后，又被告知新的需求：当获取位置失败了之后，需要修改一些信息，然后再次尝试获取位置信息。
不过幸好，我们的代码已经把大部分的逻辑抽离到了工具提供者中了，对整个工具的逻辑影响并不大。
同时我们再看看代码就会发现我们的组件除了工具提供者之外，没有方法（依赖在对象上的函数）。也就是说，我们的组件并没有对象。

**我见过很多人的代码总是喜欢打造工具提供者，而忽略了工具的本质。**迎合上面的增加的需求，那么我们的工具提供者将会变得越来越重，这时候我们应该思考到：是不是应该把工具提供出去？

让我们回到最初的需求——仅仅只是一个获取位置的组件，没错，它的核心业务就是获取位置——它不应该被组件化。它的本质应该是个工具对象，而不应该和页面相关，我们从一开始就不应该关注页面上的变化，让我们重构代码如下：

```javascript
(function (window, namespace) {
    var Gps = {
        load: function (fone, fail) {
            var data = '北京市';//获取位置伪代码
            this.check(data) ?
                done(data, Gps.state.OK) :
                fail(Gps.state.FAIL);
        },
        check: function (data) {
            return !!data;
        },
        state: { OK: 1, FAIL: 0 }
    };
    window[namespace] = Gps;
})(window, 'Gps');
```
在这里，我们直接捏死了工具提供者，我们直接将工具提供给外面的工具使用者，让工具使用者直接使用我们的工具，这里的代码无关状态、无关页面。

至此，重构完成。

## 形成自己风格的代码 ##

之所以讲这个是因为大家都有自己的编程风格。有些人的编程风格就是开篇那种代码的...
我觉得形成自己的编程风格，是建立在良好代码的和结构/语义上的。否则只会让你的代码变得越来越难读，越来越难写。
****
**单var和多var**
我个人是喜欢单var风格的，不过我觉得代码还是尽可能在使用某一方法/函数使用前进行var，有时候甚至于为了单var而变得丧心病狂：由于我又过分的喜爱[函数表达式声明][1]，函数表达式声明并不会在var语句中执行，于是偶尔会出现这种边声明边执行的代码，为了不教坏小朋友就不贴代码了(我不会告诉你们其实是我找不到了)。

**对象属性的屏蔽**
下面的代码演示了两种对象的构建，后一种通过闭包把内部属性隐藏，同样，两种方法都实现了无new化，我个人...是不喜欢看见很多this的..但还是推荐前者。

```javascript
(function () {
    //第一种，曝露了_name属性
    var Demo = function () {
        if (!(this instanceof Demo))
            return new Demo();
        this._name = 'linkFly';
    };
    Demo.prototype.getName = function () {
        return this._name;
    }

    //第二种，多一层闭包意味内存消耗更大，但是屏蔽了_name属性
    var Demo = function () {
        var name = 'linkFly';
        return {
            getName: function () {
                return name;
            }
        }
    }
});
```

**巧用变量置顶&#91;hoisting&#93;**
巧用函数声明的[变量置顶][2]特性意味着处女座心态的你放弃单var，但却可以让你的函数在代码结构上十分清晰，例如下面的代码：
```javascript
(function () {
    var names = [];
    return function (name) {
        addName(name);
    }
    function addName(name) {
        if (!~names.indexOf(name))//如果存在则不添加
            names.push(name);
        console.log(names);// ["linkFly"]
    }
}())('linkFly');
```
**if和&&**
这种代码，在几个群里都见过讨论：
```javascript
(function () {
    var key = 'linkFly',
        cache = { 'linkFly': 'http://www.cnblogs.com/silin6/' },
        value;
    //&&到底
    key && cache && cache[key] && (value = cache[key]);
    //来个if
    if (key && cache && cache[key])
        value = cache[key];
})()；
```

大概就想到这么些了，我突然发现我不太推荐的代码，都是我写的代码，囧。如果各位也还有更多有趣的代码，希望各位看官能掏出来让小弟见识见识。

<div class="l-author">
<div>作者：linkFly</div>
<div>原文：<a href="http://www.cnblogs.com/silin6/p/4273511.html" style="color: #259ec7;">http://www.cnblogs.com/silin6/p/4273511.html</a></div>
<div>出处：<a href="http://www.cnblogs.com/silin6/" style="color: #259ec7;">www.cnblogs.com/silin6/</a></div>
<div>声明：嘿！你都拷走上面那么一大段了，我觉得你应该也不介意顺便拷走这一小段，希望你能够在每一次的引用中都保留这一段声明，尊重作者的辛勤劳动成果，本文与博客园共享。</div>
</div>
**看完不要忘记推荐哟**

  [1]: http://www.cnblogs.com/TomXu/archive/2011/12/29/2290308.html
  [2]: http://openwares.net/js/javascript_declaration_hoisting.html
