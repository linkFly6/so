

#X.js使用文档

>因为经常和xml打交道，移动端用的Zepto，Zepto没有支持xml，于是决定自己编写一个简单的操作xml的类库。暂时没有考虑过pc端，正因为专注移动端，所以要的是够轻。
X.js于1.2版本中被重写，替换成了全新的工作模型。

__[查看和下载X.js][X.js]__



__[linkFly的博客][blog]__


[X.js]:https://github.com/linkFly6/linkfly.so/blob/master/LinkFLy/LinkFly/GameLife/wapXML/X.js
[blog]:http://www.cnblogs.com/silin6/


##API
>  

###X(xml, filter)
>我们的工作对象，就是X。它有4个重载，filter参数表示过滤条件，它是一个过滤函数，this指向当前的给定的xml document（默认为当前document），返回一组NodeList，将根据这组nodeList生成X对象：
X(xml[,filter])：基于xml字符串生成
__X(xml)：基于xml字符串生成__
__X(document[,xPath])：基于document对象生成，并可以根据指定的xPath生成__
__X(Element[,xPath])：基于document，并可以根据指定的xPath生成__
__X(NodeList)：基于NodeList生成__


下面的代码演示了这些重载：

```javascript
        X('<?xml version="1.0" encoding="GBK" ?><linkfly></linkfly>');
        X(document,'hello/world');
        X(document.getElementsByTagName('linkFly')[0],'hello');
        X(document.getElementsByTagName('linkFly'));
```     


>  

###X.isXML(doc)
>检测这个document是否是xml DOM，这是一个静态方法

```javascript
        X.isXML(document); //false
```

>  

###xObject.find(xPath[,context])
>在X对象下根据xPath（或节点名称）查找节点，context用于重新修正查找文，它的重载如下：
######find(xPath[,context])：基于xpath查找
######<s>find(tag[,context])：基于节点名称查找，并不支持复杂的节点查找(不再支持)</s>

下面的代码演示了它：

```javascript
        X(document).find('/DOCUMENT/linkFly');
        X(document).find('linkFly',document.getElementsByTagName('demo'));
```

###xObject.text([value])
>遵循jQuery的理念，`set all/get one`，它可以`获取/设置`当前节点的值
######text()：获取(第一个)节点的值
######text(value)：设置(所有)节点的值

下面的代码演示了它的设置和获取

```javascript
        X(document).find('linkFly').text('hello').text();//output hello
```


###xObject.attr(name,[value])
>和xObject.text如此的相似，它同样可以`获取/设置`当前节点的属性值
######attr(name)：获取(第一个)节点对应的属性值
######attr(name,value)：设置(所有)节点对应的属性值

颇为遗憾，它并不支持批量属性值的获取和设置，下面的代码演示了它的设置和获取：

```javascript
        X(document).find('linkFly').attr('name','linkFly').attr('name');//output linkFly
```

###xObject.eq(index)
>获取xObject对象中指定索引的`X对象`。

和jQuery一样，因为X对象也是一个类数组对象，所以它可能表示着多个节点，如果你想要访问索引为1的节点，则可以如下，它返回索引为1的X对象实例：


        X(document).find('linkFly').eq(1); //return xObject

###xObject.slice(start[,end])
>用于切割xObject对象中的节点集。

正因为X是一个类数组对象，它也需要提供方便的切割，`Array.prototype.slice`是一个很精髓的方法，我同样提供了这个API，详情请参考`Array.prototype.slice`，它同样不会影响原X对象，而是返回被切割后的新的X对象：


        X(document).find('linkFly').slice(0); //return xObject
        X(document).find('linkFly').slice(1,2); //return xObject
        


###xObject.splice(index,howmany,element1,.....,elementX)
>增删改`X对象`,请参阅`Array.prototype.splice`，它的操作会影响当前X对象，并返回被操作（删除）后的X对象。
它返回被删除的X对象的实例
```javascript
        X(document).find('linkFly').splice(1); 
        X(document).find('linkFly').splice(1,2); 
        X(document).find('linkFly').splice(1,2,X(document).find('demo')); 
        X(document).find('linkFly').splice(1,2,X(document).find('demo')[0],X(document).find('demo')[1]); 
```


###one more thing
>X对象还有一些更多的`属性`可能会为你解决某些疑惑

>######xObject[index]：获取X对象实例中，指定索引的节点（Element）对象

>######xObject.length：获取X对象实例的长度

###思考

>2014-10-29 00:34:24
深入了解`XPathEvaluator.evaluate()`之后发现第二个参数__不仅仅可以使用document，也可以使用element__，于是不再依赖查询上下文。
>同时测试了`XPathEvaluator.evaluate()`、`document.evaluate()`的正确使用方法，过去对这些API有一些错误的见解，现已纠正。
X.js现在终于和自己预期的功能一致了。
>  

><s>因为浏览器中HTML DOM直接挂载在BOM（window）下，而XML生成的Document如何处理很棘手，因为XML查询的底层API`XPathEvaluator.evaluate`第二个参数就是查询的上下文，也就是XML DOM，但是浏览器默认的document是HTML DOM。

>这也就出现了一个问题：__查询的上下文会断裂__。

>在API `X.prototype.slice()、X.prototype.each()`中都会曝露原生的XML Element，如果X的构造函数直接接收一个无法找到上下文的XML Element对象，那么在这个X对象上调用find()方法`底层是调用XPathEvaluator.evaluate()`就会丢失上下文，也就造成了正确的表达式查询不到结果，这个结果谁也不想看到。

>所以重新定义了X对象的工作概念——主要是围绕XML DOM展开，上下文要保证不会断开，所以在`X.prototype.each()`中为每个循环项创建新的X对象继续把XML DOM给传递下去，当然这也是不得已的做法。

>X对象现在仍然支持下面的构造函数，但它并不会正确的查询到结果：
```javascript
    var elem = document.getElementsByTagName('a'),
        linkFly = X(elem);
```

>所以，在使用了某些曝露了XML Element的API之后，例如X.prototype.slice()、X.prototype.splice()、X.prototype.each()，后续请使用X.find(xPath, context)来查找，或者使用X对象的构造函数X(document[,NodeList])来重建X对象查找。</s>

##更新日志
>####Oct 29,2014
* 移除属性 `X.prototype.document`、`X.prototype.documentElement`，找到解决方案可以无需依赖查询上下文
* 重写X对象，调整了X对象结构，大幅度优化内部逻辑，代码更加优质，内存更加合理，解耦依赖关系
* 强化`X.find(xPath,context)`查询方法


>####Oct 24, 2014
* <s>考虑到移动端性能瓶颈和复杂环境，决定还是移除xmlDocument变量针对上一次Document保留的缓存
* 强化静态方法：X.find(xPath,context)
* 对于上下文断开的问题，以异常结果的方式兼容：
    * 因为XML的查找无法根据指定的（节点）范围内查找，所以提倡在X对象链上进行操作，不推荐直接获取XML Element操作
	* `X.prototype.each()`方法委托的匿名函数，第一个参数从XML Element调整为X对象，而this仍然指向当前循环的XML Element</s>


>####Oct 23, 2014
* 修正一些bug
* 添加了静态方法：`X.find(xPath,context)` - 静态查找
* <s>发现问题：XML DOM的操作和HTML DOM的环境并不相同，所以不让让Element上下文环境断开是个问题，如果想要解决这种问题，则需要把API给断开：
	* 查找方法X(document[,xPath])、XObject.find(xPath)等依赖上下文环境，所以API挂在X对象原型上
	* 操作元素方法xObject.text([value])、xObject.attr(name,[value])等方法不依赖上下文，所以可以调整为静态方法，但是API表现并不太好
	* 或者是，提供有一套不会断开上下文的API</s>


>####Oct 12, 2014
* 添加了静态方法：X.isXML()判定XML DOM。
* 添加了实例方法：`X.prototype.each()`循环每项
* 添加说明文档
* 优化内部逻辑：
    * 不再为每一个Element都创建一个对应的X对象的实例，而是在调用X.prototype.eq()的时候为获得的Element封装X对象。
    * 可以使用数组的[索引]访问到Element


&nbsp;
>####Aug 24, 2014
* 创建X.js


##关于


__[查看和下载X.js][X.js]__

__[linkFly的博客][blog]__

##未来想法
* __支持JSONP__
* __慎重考虑是否支持ajax__
* <s>内部结构需要重写，修正instenceOf，并且优化内存消耗</s>[已完成]
* 支持AMD
* 内部类型判定更加的简洁一点
* 出一版兼容IE<=8的版本
