# JavaScript - 如果...没有方法

标签（空格分隔）： 未分类

---

<div class="l-index">
<p>
这篇文章源于我上一周所读的一篇12年的文章。原作者提出了一个问题，如果js没有原生方法Math.round()，我们如何去实现呢？
</p>
<p>对此我和我的基友进行了小小探讨，并给出了一些有意思的答案。</p>
</div>
> 本文内容如下：  
> - 如果...没有方法
> - 解决方案
> - 另类解决方案
> - 简单的分析
> - 参考和引用

##如果...没有方法
这篇文章源于上周所读的一篇2012年的文章（为了强行塞点文章篇幅，所以把该文链接放到最后的引用了...希望原作者和读者体谅下....）。
原作者在使用了`Math.round()`方法之后，突然产生了一个小念头。
>    如果，js没有`Math.round()`方法，我们又该如何去实现呢？

为此展开了一些探讨。我知道发表这么一篇文章肯定小有争议，但仍需要注明的是这篇文章仅供娱乐，或者说——玩玩代码，不会太在意性能、健壮、逻辑严谨性等XXOO的东西。
`Math.round()`就是传说中的四舍五入啦...

```javascript
        Math.round(12.1);//12
        Math.round(12.8);//13
        Math.round(-12.1);//-12
        Math.round(-12.8);//-13
```

##解决方案
原作者提供了这么些思路：
> 例如数字`6.2`，先把`6.2`转换为字符串，然后通过`String.prototype.split()`方法来分割字符串，判定字符串索引为1的值是否大于5，再处理索引为0的值，代码如下：

```javascript
        //num===6.2
        function round(num) {
            var nums = String(num).split("."),//[6,2]
                num0 = nums[0],//6
                num1 = nums[1];//2

            if (parseInt(num1.substring(0, 1)) < 5) { //2<5
                return parseInt(num0);
            } else {
                if (num0 > 0) {
                    return parseInt(num0) + 1;
                } else {//负数
                    return parseInt(num0) - 1;
                }
            }
        }
```

原作者并不满意上面的解决方案，提出了如果连js原生方法都不使用呢？什么`String()`、`parseInt()`都不使用该怎么去做呢？
于是提出了第二种解决方案：
> 这个问题的关键在于判定小数点后的数字是否大于5，所以我们把传递进来的数字`6.2*10%10`即可得到小数点后的数字，这时候再判定这个小数是否大于5即可。

```javascript
        //num===6.2
        function round(num) {
            var round_x = (((10 * num) % 10) > 0) ?
                ((10 * num) % 10) : //正数
                -((10 * num) % 10);//负数

            if (round_x < 5) {
                return num - (num % 1);//把小数点后的的数字干掉
            } else {
                return (num > 0 ?
                    (num - (num % 1) + 1) : //正数
                    num - (num % 1) - 1); //负数
            }
        }
```

原文只讲述到这里，后来我跟基友聊到了这篇文章，我的基友给出了另外一点思路：
> 因为是四舍五入原理，所以给当前的数字+0.5，得到的值直接丢弃小数点后面的部分转换为整数（类似parseInt），原来的数字也转换为整数丢弃小数点后面的部分，这两个数如果相差<1，表示取原来数字的整数，否则取新数字的整数。

```javascript
        function round(num) {
            var value = num > 0 ?
                num + 0.5 :     //正数
                -(num - 0.5);   //负数
            value = value - value % 1;//得到新数的整数部分
            //如果相差<1
            return value - num < 1 ?
                   num - num % 1 :
                   value;
        }
```

至此，稍微正常点的解决方案介绍完毕，下面我们来感受下什么叫做玩代码。

#另类解决方案

听到基友的思路我表示非常赞非常好人民需要你代码需要你下一个图灵目测就是你了小伙子要不要买本《颈椎病康复指南》看看决定如何拯救世界？
然后给他感受了一下这个世界森森的恶意——也就是原文评论里的代码。
下面是欣赏代码时间，分析代码之类的肯定要放在后面。
```javascript
        //@Gray Zhang的"给跪版"，不支持负数
        function round(x) {
            return ~~(x + 0.5);
        }


        //@Gray Zhang的"给跪加深版"，支持正负数
        function round(x) {
            return ~~(x > 0 ? (x + 0.5) : (x - 0.5));
        }

        
        //@强子~Developer的"请收下我的膝盖版"
        function round(x) {
            return (x > 0 ? x + 0.5 : x - 0.5) | 0;
        }
```

看到这些代码当时我就给跪了，突然有种回家找家影楼给别人撒撒花，扬扬裙摆，送送快递的想法。好吧，我承认我的位运算就是个渣。

当然，你以为我们的思考仅限于此？no no no，我们觉得用这些什么`if`、`else`、`三目运算符`实在太low，于是我和基友想：如果连这些运算符都给干掉呢？只通过位运算来实现。
在各种恶补位运算的知识下，我的基友提出了另外一种解决方案：
```javascript
        function round(x) {
            return ~~(x + 0.5 + (x >> 30));
        }
```


##简单的分析

觉得上面的代码逼格十足？那么让我们"粗略"的分析一下吧（详细计算、补码之类的知识请拉到参考引用）。
这些代码都运用了位运算——我们重点关照下`~(按位取反运算)`和`>>(有符号右偏移运算)`。

首先，偷点基础资料来：
###重温整数
> ECMAScript 整数有两种类型，即有符号整数（允许用正数和负数）和无符号整数（只允许用正数）。在 ECMAScript 中，所有整数字面量默认都是有符号整数。
有符号整数使用 31 位表示整数的数值，用第 32 位表示整数的符号，0 表示正数，1 表示负数。数值范围从 -2147483648 到 2147483647。见下图：

**因为样式的原因图片会存在拉伸，看不清请拿鼠标拽一下图片到新的浏览器标签页即可。**

![ct_js_integer_binary_signed_32bits][1]

js中`toString()`方法可以to出二进制，而`parsetInt()`方法的第二个参数可以指定转换进制：
```javascript
        (18).toString(2) //"10010"
        parseInt(10010,2) //18
```

&nbsp;&nbsp;

###~的运算过程
`~`就是按位取反，类似：`00111`，取反则为`11000`。
取反会干掉小数，`~`运算符的运算过程可以戳[这里][2]，我们看到调用了`ToInt32()`：

![ToInt32][3]

所以会被干掉小数，所以我们可以这么来实现小数转整数：
```javascript
        ~~18.5          //18 - 等同于parseInt(18)
        parseInt(18.5)  //18
```
`~~`是按位取反再取反，本质上就是一个干掉小数的过程。

&nbsp;&nbsp;

###>>右移动运算符
`>>`是有符号右移运算符由两个大于号表示（>>）。它把 32 位数字中的所有数位整体右移，同时保留该数的符号（正号或负号）。有符号右移运算符恰好与左移运算相反。
我们来解析一下这段代码：
```javascript
    -2>>30 // -1 （感谢群里的@Superior和@Jeff Xiao提供）
```
过程如下：

> - 1 0000000000000000000000000000010 //-2二进制
> - 1 1111111111111111111111111111110 //-2进行补码
> - 1 1111111111111111111111111111111 //向右移动30，高位以符号位（第32位）补全
> - 1 0000000000000000000000000000001 //因为符号位为符号，所以是负数，则补码形式存储，还原为-1

&nbsp;&nbsp;

我们再来看看我的基佬提供的代码：
```javascript
        ~~(x + 0.5 + (x >> 30))
```

> - 假设X是-12.5
> - 首先，-12.5+0.5===-12
> - -12.5&#62;&#62;30：上面我们说过，ECMAScript有符号整数使用`31`位表示整数的数值，所以在ECMAScript中，任何一个数右移30位得到的结果只能是2种：正数得到0，负数得到-1。
> - -12-1===-13

由此完成了我们的运算，不得不说这个`+0.5`和`>>30`很是精髓（虽然我基佬也是查了半天资料才搞出来 = =）。

再次声明，这篇文章和代码，纯属娱乐。对于上面看的迷迷糊糊，位运算之类的东西还搞不明白的童鞋可以看看下面的参考。

代码总是很有意思的，没事玩玩代码放松一下自己也是好的，顺便还可以涨姿势，何乐而不为呢？顺便说一下，我和基佬商量着以后要是当了面试官就准备这个问题问一下别人——当然，只是娱乐娱乐。再次感谢群里的&#64;Superior和&#64;Jeff Xiao为我细心的讲解。
最后，向原文和前辈致敬：[《JS，如果没有方法。。。（不借助任何JS方法实现round方法）》][4]。

##参考和引用
[JS，如果没有方法。。。（不借助任何JS方法实现round方法）][5]
[ECMAScript 位运算符][6]
[【译】从一行代码来学习JavaScript][7]
[javascript 中 !~ 什么意思][8]
[按位与（&）按位或（|）按位异或（^）按位取反（~）左移（<<）右移(>>) ][9]
[Javascript小技巧,去掉小数位并且不会四舍五入][10]
[补码与求补运算(最基本也最容易忽略的东西)][11]
[MDN - parseInt][12]


<div class="l-author">
<div>作者：linkFly</div>
<div>原文：<a href="http://www.cnblogs.com/silin6/p/4367019.html">http://www.cnblogs.com/silin6/p/4367019.html</a></div>
<div>出处：<a href="http://www.cnblogs.com/silin6/">www.cnblogs.com/silin6/</a></div>
<div>声明：嘿！你都拷走上面那么一大段了，我觉得你应该也不介意顺便拷走这一小段，希望你能够在每一次的引用中都保留这一段声明，尊重作者的辛勤劳动成果，本文与博客园共享。</div>
</div>


  [1]: http://images.cnblogs.com/cnblogs_com/silin6/656649/o_ct_js_integer_binary_signed_32bits.gif
  [2]: http://bclary.com/2004/11/07/#a-9.5
  [3]: http://images.cnblogs.com/cnblogs_com/silin6/656649/o_%E6%8C%89%E4%BD%8D%E5%8F%96%E5%8F%8D.png
  [4]: http://www.cnblogs.com/xiao-yao/archive/2012/09/11/2680424.html#2469979
  [5]: http://www.cnblogs.com/xiao-yao/archive/2012/09/11/2680424.html#2469979
  [6]: http://www.w3school.com.cn/js/pro_js_operators_bitwise.asp
  [7]: http://www.creatshare.com/learning-much-javascript-one-line-code.html
  [8]: http://www.cnblogs.com/lonny/p/4282055.html#3127616
  [9]: http://blog.csdn.net/zhongjling/article/details/8004103
  [10]: http://www.cnblogs.com/kkun/archive/2012/01/30/2332309.html
  [11]: http://www.cnblogs.com/acheng99/archive/2009/09/02/1559037.html
  [12]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/parseInt