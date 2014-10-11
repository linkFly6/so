

#X.js使用文档

>因为经常和xml打交道，移动端用的Zepto，Zepto没有支持xml，于是决定自己编写一个简单的操作xml的类库。

>pc端的Sizzle（jQuery选择器引擎）是支持xPath（xml的查找），所以暂时没有考虑过pc端，正因为专注移动端，所以要的是够轻。

#######[查看和下载X.js][X.js]

>  

#######[linkFly的博客][blog]


[X.js]:https://github.com/linkFly6/linkfly.so/blob/master/LinkFLy/LinkFly/GameLife/wapXML/X.1.0.js
[blog]:http://www.cnblogs.com/silin6/


##API
>  

###X(xml, filter)
>我们的工作对象，就是X！它有5个重载，filter参数表示过滤条件，它是一个过滤函数，this指向当前的给定的xml document（默认为当前document），返回一组NodeList，将根据这组nodeList生成X对象：
X(xml[,filter])：基于xml字符串生成
####X(document[,filter])：基于xml document对象
####X(document[,xPath])：基于document，并允许给定的xPath生成
####X(document[,Element])：基于document，并允许给定的Element生成
####X(document[,NodeList])：基于document，并允许给定的NodesList生成

下面的代码演示了这些重载：

```javascript
        X('<?xml version="1.0" encoding="GBK" ?><linkfly></linkfly>');
        X('<?xml version="1.0" encoding="GBK" ?><linkfly></linkfly>',function(doc){
                return [doc.documentElement];
        });
        X(document);
        X(document,document.getElementsByTagName('linkFly')[0]);
        X(document,document.getElementsByTagName('linkFly'))
```     


>  

###X.isXML(doc)
>检测这个document是否是xml DOM，这是一个静态方法


        X.isXML(document); //false

>  

###xObject.find(xPath)
>在X对象下根据xPath（或节点名称）查找节点，context用于重新修正上下文，它的重载如下：
####find(xPath[,context])：基于xpath查找
####find(tag[,context])：基于节点名称查找，并不支持复杂的节点查找

__虽然xObject.find()提供了使用[节点名称]的查找，但是我仍然不建议这么做，为此是性能的牺牲，并且它并不强大__

下面的代码演示了它：


        X(document).find('/DOCUMENT/linkFly');
        X(document).find('linkFly');


###xObject.text([value])
>遵循jQuery的理念，`set all/get one`，它可以`获取/设置`当前节点的值
####text()：获取(第一个)节点的值
####text(value)：设置(所有)节点的值

下面的代码演示了它的设置和获取


        X(document).find('linkFly').text('hello').text();//return hello


###xObject.attr(name,[value])
>和xObject.text如此的相似，它同样可以`获取/设置`当前节点的属性值
####attr(name)：获取(第一个)节点对应的属性值
####attr(name,value)：设置(所有)节点对应的属性值

颇为遗憾，它并不支持批量属性值的获取和设置，下面的代码演示了它的设置和获取：


        X(document).find('linkFly').attr('name','linkFly').attr('name');//return linkFly

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

        X(document).find('linkFly').splice(1); 
        X(document).find('linkFly').splice(1,2); 
        X(document).find('linkFly').splice(1,2,X(document).find('demo')); 
        X(document).find('linkFly').splice(1,2,X(document).find('demo')[0],X(document).find('demo')[1]); 


###one more thing
>X对象还有一些更多的`属性`可能会为你解决某些疑惑

>####xObject[index]：获取X对象实例中，指定索引的节点（Element）对象

>####xObject.document：获取X对象实例的上下文(XML DOM)

>####xObject.documentElement：获取X对象中上下文(XML DOM)的根节点(documentElement)

>####xObject.length：获取X对象实例的长度



##更新日志

>####Oct 12, 2014
* 添加了静态方法：X.isXML()判定XML DOM。
* 添加了实例方法：X.prototype.forEach()循环每项
* 添加说明文档
* 优化内部逻辑：
    * 不再为每一个Element都创建一个对应的X对象的实例，而是在调用X.prototype.eq()的时候为获得的Element封装X对象。
    * 可以使用数组的[索引]访问到Element


&nbsp;
>####Aug 24, 2014
* 创建X.js


##关于


###[查看和下载X.js][X.js]

>  

###[linkFly的博客][blog]
