#Service.js 帮助文档

> Service.js是对服务体系增强的一套基础类库，支持AMD规范。  
核心目标是把服务中常用的工具集成进来，并给一些模块化的组件提供基础工具。  
如果觉得这份文档仍然不够详尽，可以参考源码注释。  
1700多行的源码有700行的注释，基本上每个曝露的API都文档注释了。

Service.js的模块结构如下：
- 基础工具
- 服务模块（异步加载）
- 逻辑增强
- GPS
- 数据中心
- DOM增强


##目录

- [基础工具](#基础工具)
 - [使用](#使用)
 - [核心和内部工具](#核心和内部工具)
 - [Service.config - 配置](#serviceconfigoptions)
 - [Service.format - 格式化字符串](#serviceformatstr-object)
 - [Service.parseData - 转换字符串为js中的基础数据类型](#serviceparsedatavalue)
 - [Service.byteLength - 检测字符串byte长度](#servicebytelengthtargetfix)
 - [Service.truncate - 裁剪字符串](#servicetruncatetarget-length-truncation-isbyte)
 - [Service.parseDate - 转换日期](#serviceparsedatejsondate)
 - [Service.dateFormat - 格式化日期](#servicedateformatjsondate-format---格式化日期)
 - [Service.dateToLocal - 本地化日期](#servicedatetolocalolddate-nowdate)
 - [Service.param - 编码对象](#serviceparamobj-deep)
 - [Service.Search - 获取url参数](#servicesearchurl)
 - [Service.cookie - 读取/设置cookie](#servicecookiename-value-expiredays)

- [服务模块（异步加载,二次加载）](#服务模块)
 - [Service.qo - 获取qo一个对象](#serviceqooptions)
 - [Service.CallBacks - 异步队列 ](#servicecallbacks)
 - [Service.getJSONP - JSONP请求](#servicegetjsonpurl-done-fail-time)
 - [Service.defer - 异步队列的JSONP请求 ](#servicedeferurl-done-fail-time)
 - [Service.fetch - 异步队列的二次加载 ](#servicefetchqo-success-error-time)
 - [Service.request - 传统的二次加载](#servicerequestqo-success-error-time)
 - [Service.ajax - 异步队列的ajax ](#serviceajaxoptions)

- [逻辑增强](#逻辑增强)
 - [Service.throttle - 函数节流：节流阀](#servicethrottlefunc-wait-options)
 - [Service.debounce - 函数节流：防反跳](#servicedebouncefunc-wait-immediate)
 - [Service.after - 限定函数运行下限次数](#serviceaftercount-func-this)
 - [Service.before - 限定函数运行上限次数](#servicebeforecount-func-this)
 - [Service.once - 构建一次性函数](#serviceoncefunc-this)

- [GPS](#gps) 
 - [Service.addr - 获取本地地址](#serviceaddrdata)
 - [Service.gps - 发送gps请求](#servicegpsdone-fail-time)
 - [Service.position - 获取本地gps（经纬度）信息](#serviceposition)

- [数据中心](#数据中心)
 - [Service.Database - 创建一个在指定命名空间下工作的数据中心对象](#servicedatabasenamespace)
 - [Database.prototype.val - 获取/存储数据](#databaseprototypevalkey-value)
 - [Database.prototype.remove - 移除数据](#databaseprototyperemovekey)
 - [Database.prototype.clear - 清空命名空间下的数据](#databaseprototypeclear)
 - [Service.Database.clear - 清空数据中心](#servicedatabaseclear)

- [DOM增强](#呵呵) 
 - [Service.imgLoad - 图片加载](#serviceimgloadelem-options)
 - [Service.Support - 浏览器支持](#servicesupport)
 - [Service.animate - 动画](#serviceanimateelem-properties-duration-ease-callback-delay)

&nbsp;
 
 
##基础工具
 
###使用
 
 service注册在`window.sogou.service`，全局访问，同时支持AMD规范，AMD中访问模块名为`service`。
 
 ```javascript
 	window.sogou.service.config({ debug: true });//全局访问
	//AMD访问
	require(['service'], function (service) {
        service.config({ debug: true });
    });
 ```
 
**下面所有的代码中都使用AMD下的变量名service作为演示，变量`service`都代表全局对象`window.sogou.service`。**

 &nbsp;
 
###核心和内部工具
 
 各大框架和基础类库都有这么一套，都是内部和组件常用工具，对这些工具没兴趣的可以略过了。
 
```javascript
	//判断是否是函数
    service.isFunction(document.addEventListener);//true
	
	//判断是否是Array
	service.isArray([]);//true
	
	//判断是否类数组（Arraylike）
	service.isArrayLike({});//false
    service.isArrayLike(document.childNodes);//true
    service.isArrayLike($('body'));//true
	
	//判断是否是对象
	service.isObject(document.body);//true
	service.isObject([]);//false
	
	//判断是否是纯粹的javascript对象（object）
	service.isPlainObject({});//true
    service.isPlainObject(document.body);//false
	service.isPlainObject($);//false
	
	//判断是否是空对象
	service.isEmptyObject({ name: 'linkFly' });//false
	service.isEmptyObject({});//true
	
	//驼峰转换
	service.camelCase('-webkit-animation-name');//WebkitAnimationName
	
	//遍历数组
    service.each(['a'], function (value, i) {
        console.log(value, i);//a,0
    })
    //遍历对象
	service.each({ author: 'linkFly' }, function (key, value) {
        console.log(key, value);//author,linkFly
    })
	
	//根据原数组/类数组生成新的数组，类似但强于Array.prototype.map ECMAScript 5(ES5)规范
	service.map(['a', 'b'], function (value, i) {
            return i;
    });// [0, 1]
	
	//创建一个不可修改的枚举
    service.createEnum({
        MALE: '男',
        FEMALE: '女'
    });
    
    
	//判断类型
    service.type('linkFly');//string
    service.type(true);//boolean
    service.type(0);//number
    service.type([]);//array
    service.type({});//object
    service.type(/linkFly/);//regexp
    service.type(new Date);//date
    service.type(new Error);//error
    service.type(window.alert);//function
    service.type(window);//object
	
	//将一个任务挂起到下一个时钟周期执行
    var startTime = service.now();//开始时间
    service.nextTick(function () {
        console.log(service.now() - startTime);//输出时间差
    });
	
	//当前时间戳
	service.now();
	
	//字符串补位
	service.padNumber('2', 3);//002
    service.padNumber('2', 3, 'a');//aa2
	
	//判断原字符串开头是否是指定的字符串结尾，模拟String.prototype.startsWith - ECMAScript 2015(ES6) 规范
	service.startsWith('linkFly', 'link');//true
    service.startsWith('linkFly', 'link', 2);//false

	
	//判断原字符串是否是指定的字符串结尾，模拟String.prototype.endsWith - ECMAScript 2015(ES6) 规范
    service.endsWith('linkFly', 'Fly');//true
    service.endsWith('linkFly', 'Fly', 4);//false
	
```

&nbsp;

###Service.config(options)
> 进行全局自定义配置，以下两个自定义配置需要注意
- url - url中必须带有占位符，占位符`${0}`表示qoInfo，占位符`${1}`则表示keywords（查询词），例如直连openhub的时候
- getGpsUrl - url中必须带有占位符，占位符`${0}`表示经度，`${1}`表示纬度

```javascript
	//这些都是默认配置
    service.config({
		debug: false,//是否调试模式
        timeout: 16e2,//JSONP超时时间（包括二次加载）
        url: '/web/features/vr.jsp?keyword=${1}&qoInfo=${0}&cb=?',//二次请求url
        gpsCookieId: 'G_LOC_MI',//gps cookieId
        qqposName: 'qqpos',//gps qqpos存储的cookieName
        gpsTimeout: 6000,//gps超时时间
        gpsCookieTime: 0.02,//gpsCookie存放时间
        getGpsUrl: 'http://m.sogou.com/web/maplocate.jsp?points=${0},${1}&cb=?'//gps（经纬度）获取的url
    });
```

&nbsp;

###Service.format(str, object)
> 格式化一个字符串，通过在字符串中利用占位符进行占位，再用对象或数组进行格式化，占位符支持两种：
- Array - 使用`${索引}`进行占位，例如：`${0}`,`${1}`则表示数组索引为0和1的元素填充
- Object - 使用`${属性名}`进行占位，例如：`${name}`则表示使用该对象的name属性值填充

重载
- service.format(str , arg1 , arg2 , arg3...) - 通过Array（多参数）格式化 
- service.format(str , object) - 通过Object格式化

```javascript
    service.format('${0}ink${1}ly', 'l', 'F');//linkFly
    service.format('${first}ink${last}ly', {
        first: 'l',
        last: 'F'
    });//linkFly
```

&nbsp;

###Service.parseData(value)
> 转换一个字符串为js中的基础数据类型

```javascript
	service.parseData('{ name: "linkFly", run: function () { console.log(this.name); } }');//{ name: "linkFly", run: function () { console.log(this.name); } }
    service.parseData('true')//true
    service.parseData('null')//null
```

&nbsp;

###Service.byteLength(target,fix)
> 检测字符串byte长度，两个重载。

- target{ String } - 要检测的字符串
- fix{ Int } - 表示汉字的字符长度，默认为2

重载
- service.byteLength(target) - 检测字符串byte长度，汉字默认为2
- service.byteLength(target , fix) - 检测字符串byte长度，并指定汉字的长度

```javascript
    service.byteLength('大家好a');//7
    service.byteLength('大家好a', 3);//10
```

&nbsp;

###Service.truncate(target, length, truncation, isByte)
> 裁剪一个字符串

- target{ String } - 裁剪的目标
- length{ Int } - 裁剪的长度，默认为30
- truncation{ String } - 截断后缀，当超过裁剪长度后追加的后缀字符，默认为...
- isByte{ Boolean } - 是否按照字节模式截断，默认为false

重载
- service.truncate(target) - 裁剪字符串，默认按照长度30裁剪
- service.truncate(target, length) - 配置裁剪长度
- service.truncate(target, length, truncation) - 配置裁剪后缀
- service.truncate(target, length, isByte) - 配置是否按照字节模式
- service.truncate(target, length, truncation, isByte) - 全部配置

```javascript
    service.truncate('大家好', 2);//大家...
    service.truncate('大家好a', 4, true);//大家...
    service.truncate('风住过的地方', 7, 'abc', true);//风住过的abc
```

&nbsp;

###Service.parseDate(jsonDate)
> 转换一个时间戳或序列化的时间戳为Date对象

- jsonDate：时间戳[1436677646736]或序列化后的时间戳[/Date(1436677646736)/]

重载：
- service.parseDate(jsonDate) - 时间戳转换
- service.parseDate(serializeDate) - 序列化时间戳转换

```javascript
    service.parseDate(1436677646736);// Date {Sun Jul 12 2015 13:07:26 GMT+0800}
    service.parseDate('/Date(1436711484349)/');// Date {Sun Jul 12 2015 22:31:24 GMT+0800}
```

&nbsp;

###Service.dateFormat(jsonDate, format) - 格式化日期
> 格式化一个时间戳/Date/序列化时间戳为指定的格式

- jsonDate{ Date | jsonDate | timespan } - 要格式化的时间戳/Date对象/序列化时间戳
- format{ String } - 格式化

> 格式化格式例如：`yyyy年MM月dd日 HH:mm:ss`，则会格式出：`2015年7月12日 20:51:19`，所有格式如下：  
yyyy - 4位数年份，例如：2015  
MM - 2位数月份，自动补零，例：02  
M - 1位数月份，例：2  
dd - 2位数日期，例：08  
d - 1位数日期，例：8  
HH - 2位数24小时,例：3  
H - 1位数24小时,例：03  
hh - 2位数12小时,例：PM 08/AM 03  
h - 1位数12小时,例：AM 8/PM 3  
mm - 2位数分钟数,例：09  
m - 1位数分钟数,例：9  
ss - 2位数秒数,例：01  
s - 1位数秒数,例：1  
fff - 3位数毫秒,例：009  
f - 1位数毫秒,例：9  


重载：
- service.dateFormat(String) - 格式化时间戳，默认格式化格式为：yyyy-MM-dd HH:mm:ss
- service.dateFormat(Date) -  格式化Date，默认格式如上
- service.dateFormat(String, String) - 格式化时间戳，并指定格式
- service.dateFormat(Date, String) - 格式化Date，并指定格式

```javascript
    service.dateFormat(1436711580427, 'yyyy年MM月dd日');//2015年07月12日
    service.dateFormat(1436711580427, 'yyyy年MM月dd日 h:m:s - f');//2015年07月12日 PM10:33:0 - 427
```

&nbsp;

###Service.dateToLocal(oldDate, nowDate)
> 对比两个日期对象的时间差，转换为本地文本，返回的本地化的文本如下：  
刚才 - 小于1分钟  
59分钟前 - 小于1个小时  
23小时前 - 小于24小时  
6天前 - 小于7天  
2015年7月12日 20:58:49 - 超过6天   

- oldDate{ Date | jsonDate | timespan } - 要计算的时间
- nowDate{ Date | jsonDate | timespan } - 更新的时间（默认为当前时间）

重载：
- service.dateToLocal(oldDate) - 默认利用当前时间作为条件
- service.dateToLocal(oldDate, nowDate) - 计算两个时间

```javascript
    service.dateToLocal(1436711580427, 1436711791231);//3分钟前
    service.dateToLocal(1436711580427, 1436812791231);//1天前
```

&nbsp;


###Service.param(obj, deep)
> 编码一个对象（为url），注意编码的对象如果有function也会被编码，通过调用`encodeURIComponent`进行编码

- obj{ Object } - 要编码的对象
- deep{ Boolean } - 是否深度编码（当一个对象包含子对象的时候，是否也编码这个子对象），默认为false

重载：
- service.param(obj) - 编码一个对象（为url）
- service.param(obj, deep) - 编码一个对象，并指定是否深度编码

```javascript
    service.param({ name: 'linkFly', say: '大家好' });//name=linkFly&say=%E5%A4%A7%E5%AE%B6%E5%A5%BD
    service.param({ name: 'linkFly', qo: { say: '大家好' } }, true);//name=linkFly&say%3D%25E5%25A4%25A7%25E5%25AE%25B6%25E5%25A5%25BD
```

&nbsp;

###Service.Search(name, url)
> 注意，获取url参数，`service.Search`是一个对象，它支持静态获取参数的，之所以提供动态获取是因为HTML5的API `pushState`支持无刷新修改url参数。

- name{ String } - 要获取的参数名
- url{ String } - 要获取参数的url，默认为`window.location.search`

重载：
- Service.Search(name) - 动态获取当前页面url的参数
- Service.Search(name, url) - 动态获取指定url的参数 
- Service.Search[name] - **静态获取**当前页面的参数，它是一个当前页面url的静态快照，当前页面的url如果变动过并不会改变静态属性的值。

```javascript
    service.Search('name', '?name=linkFly');//linkFly
    service.Search('hello', '?hello=%E5%A4%A7%E5%AE%B6%E5%A5%BD');//大家好
```

&nbsp;


###Service.cookie(name, value, expiredays)
> 读取/设置cookie

- name - 读取/设置的cookie名称
- value - 设置的cookie值
- expiredays - 过期时间（天）

重载：
- Service.cookie(name) - 读取cookie，读取的值会尝试自动转换
- Service.cookie(name, value) - 设置永久有效cookie
- Service.cookie(name, value, expiredays) - 设置cookie，并设置有效天数

```javascript
    //set
    service.cookie('test', { name: 'linkFly', say: '大家好' });
    service.cookie('name', 'linkFly');
    service.cookie('demo', 'true');
    service.cookie('null', 'linkFly', -1);
    //get
    service.cookie('test');// Object { name="linkFly",  say="大家好"}
    service.cookie('name');//'linkFly'
    service.cookie('demo');//true
    service.cookie('null');//""
```

&nbsp;

##服务模块
###Service.qo(options)
> 获取一个QueryObject（qo）配置对象，默认配置参见代码 

- options{ Object } - 要自定义的qo配置

重载
- Service.qo() - 得到一个默认配置的qo对象
- Service.qo(options) - 得到一个自定义配置的qo对象

```javascript
    service.qo({
        query: '',//name::电影票::0
        vrQuery: '',//name::电影票::0
        classId: "",//70010700
        classTag: '',//MULTIHIT.Cinema.All
        tplId: '',//70010700
        sortRules: '',//1::desc
        start: 0,//起始页
        item_num: 10,//数据个数
        location: 0,
        isLocation: null,//1
        locationStr: null,
        isGps: 0,
        searchScope: null,//30000
        gpsItemNum: null,//3000
        pageTurn: 0,//是否翻页
        gps: null//116.40359160|39.92001556(经纬度)
    });
```

&nbsp;

###Service.CallBacks()
> 一个强大的异步队列控制对象，内置在[deferJsonp](https://github.com/linkFly6/deferJsonp)中。  
传统的异步任务没有队列的概念，Service内置了Callbacks工作对象，用于控制异步任务的队列，让无序的异步任务有序的执行。  
尤其在ajax/JSONP中，利用浏览器最大HTTP线程，最快发送异步请求，最短且有序的响应。

重载

- Callbacks.prototype.add(callback) - 传入一个回调函数，把它加入任务队列中，并返回一个函数id
- Callbacks.prototype.done(id) - 根据id找到对应的函数并执行，执行条件是在这个函数前面的任务队列已经没有其他任务了


```javascript
    var callbacks = new service.CallBacks,//创建一个Callbacks对象，可以无new化创建
        id1 = callbacks.add(function () {
            console.log('0', arguments);
            return 0;
        }),
        id2 = callbacks.add(function () {
            console.log('1', arguments);;
        });
    callbacks.done(id2);//无输出，要等待id1完成
    setTimeout(function () {
        callbacks.done(id1);//约1000ms后，先输出"0 []",后输出"1 [0]"
    }, 1000)
```

&nbsp;

###Service.getJSONP(url, done, fail, time)
> 发送一个传统的JSONP请求

- url{ String } - 请求的url，可以使用?占位符自动生成回调函数名称
- done{ Function } - 成功后执行的回调函数，参数是服务器JSONP回调函数的传递的参数
- fail{ Function } - 超时后执行的回调函数
- time{ Int } - 超时时间（ms），默认为全局配置`service.config({ timeout : 16e2 })`

重载
- Service.getJSONP(url,done) - 发送一个回调函数
- Service.getJSONP(url,done,time) - 设置超时时间
- Service.getJSONP(url,done,fail) - 设置超时后执行的函数，使用默认配置超时时间
- Service.getJSONP(url,done,fail,time) - 全部配置

```javascript
    var url = '/demo?callback=?';
    service.getJSONP(url, function () {
        console.log('done');
    });//默认超时时间可以通过service.config({ timeout : 16e2 })配置，默认是16e2
    
    service.getJSONP(url, function () {
        console.log('done');
    }, 3000);//3000ms后执行

    service.getJSONP(url, function () {
        console.log('done');
    }, function () {
        console.log('fail');
    }, 3000)
```

&nbsp;

###Service.defer(url, done, fail, time)
> 发起一个异步队列的JSONP请求，它的回调函数执行时机依赖上一个JSONP的函数执行与否。  
异步队列的工作模型和细节请参考：[DeferJsonp](https://github.com/linkFly6/deferJsonp)

- url{ String } - 请求的url，可以使用?占位符自动生成回调函数名称
- done{ Function } - 成功后执行的回调函数，参数是服务器JSONP回调函数的传递的参数
- fail{ Function } - 超时后执行的回调函数
- time{ Int } - 超时时间（ms），默认为全局配置`service.config({ timeout : 16e2 })`

重载
- Service.defer(url,done) - 发送一个回调函数
- Service.defer(url,done,time) - 设置超时时间
- Service.defer(url,done,fail) - 设置超时后执行的函数，使用默认配置超时时间
- Service.defer(url,done,fail,time) - 全部配置

```javascript
    var url = '/demo?callback=?';
    //假如这条请求花了1000ms
    service
        .defer(url, function () {//假如这条请求花了1000ms
            return 'data';
        }).defer(url, function () {//假如这条请求花了1200ms

            console.log(arguments);//['服务器返回数据','data']
        });//两条请求一共耗时1200ms完成

    //参数和service.getJSONP一样
    service.defer(url, function () {//这个函数等待1200ms后执行
        console.log('done');
    }, function () {
        console.log('fail');
    }, 1000);
```

&nbsp;

###Service.fetch(qo, success, error, time)
> 发起一个含有异步队列模型的二次加载，所有的自定义配置都会和默认配置进行合并，没有填写的属性将采用默认属性值。  
如果需要发送直连的请求（从openHhub请求），可以全局配置，也可以使用`Service.fetch(options)`重载完整配置请求。  
强烈推荐使用，特性如下：
 1. 让HTTP请求拥有顺序，并且提升存在依赖关系的HTTP请求的速度
 2. 请求中可以得到上一次请求的结果（可以被上一次请求中的回调函数重写）
 3. 自动验证XML正确性

- qo{ Object } - qo对象，参考`service.qo(options)`，会和默认qo配置对象进行合并
- success{ Function } - 异步加载成功后执行的回调函数，它的第一个参数是JSONP返回的数据，后续的参数在过去全部所有异步队列模型合并的参数
- error{ Function } - 异步加载失败后执行的回调函数，第一个参数如果是为`false`，则表示逻辑错误，为`true`则表示超时错误，后续的参数同上
- time{ Int } - 超时时间（ms），默认为全局配置`service.config({ timeout : 16e2 })`
- options{ Object } - 传递`options`则表示完整配置整个二次加载，它包含这些属性
 - options.url{ String } - 请求url，默认为全局配置`service.config({ url : "/web/features/vr.jsp?keyword=${1}&qoInfo=${0}&cb=?" })`
 - options.keywords{ String } - 请求关键词（keywords），默认为"sogou"，在url中使用`${1}`作占位符
 - options.filter{ Boolean } - 是否过滤数据，默认二次请求加载的XML数据都会进行验证数据正确性，验证不通过则触发`options.error`，默认为true。
 - options.success{ Function } - 二次加载请求成功后执行的回调函数
 - options.error{ Function } - 二次加载请求失败后执行的回调函数
 - options.time{ Int } - 超时时间（ms），默认为全局配置`service.config({ timeout : 16e2 })`
 - options.qo{ Object } - qo对象，参考`service.qo(options)`，会和默认qo配置对象进行合并，在url中使用`${0}`作占位符


重载
- Service.fetch(qo) - 传入qo，通过识别qo中是否含有属性`tplId`实现
- Service.fetch(qo, success) - 传入成功后执行的回调函数，采用全局默认JSONP超时时间设置
- Service.fetch(qo, success, error) - 传入失败后执行的回调函数
- Service.fetch(qo, success, time) - 传入超时时间（ms）
- Service.fetch(qo, success, error, time) - 传入完整qo配置
- Service.fetch(options) - 传入完整请求配置对象

```javascript
    service.fetch({
        query: 'fuwu_type::搬家::0',
        vrQuery: 'fuwu_type::搬家::0',
        classId: '70014600',
        classTag: 'MULTIHIT.58FUWU.GONGSI',
        tplId: '70014600',
        item_num: '10',
        location: 1,
        start: 0
    }, function (xml) {//成功回调

        console.log(xml);//XML数据

        return '搬家';//覆盖返回值

    }, function (isTimeout) {//失败回调

        console.log(isTimeout);//true：超时异常，false：逻辑异常

    });


    //Service.fetch(options) - 传入完整配置
    service.fetch({
        //qo
        qo: {
            query: 'fuwu_type::搬家::0',
            vrQuery: 'fuwu_type::搬家::0',
            classId: '70014600',
            classTag: 'MULTIHIT.58FUWU.GONGSI',
            tplId: '70014600',
            item_num: '10',
            location: 1,
            start: 0
        },

        //是否过滤（自动验证XML正确性）
        filter: true,

        //请求的url，${0}填充qo，${1}填充keywords
        url: '/web/features/vr.jsp?keyword=${1}&qoInfo=${0}&cb=?',

        //关键词
        keywords: 'sogou',

        //成功回调
        success: function (xml, data) {
            //这里的函数在上一次请求的回调函数执行完成后执行，并且可以得到上一次请求的结果

            console.log(xml, data, arguments);//XML数据,'搬家',[XML数据,'搬家']
        },

        //失败回调
        error: function (isTimeout) {
            console.log(isTimeout);//true：超时异常，false：逻辑异常
        },

        //超时时间
        time: 2000
    });
```

&nbsp;

###Service.request(qo, success, error, time)
> 和`service.fetch()` API/重载一致，只是它的请求是无序的（没有异步队列模型），回调函数中也得不到上一次请求返回的结果

```javascript
    service.request({
        query: 'fuwu_type::搬家::0',
        vrQuery: 'fuwu_type::搬家::0',
        classId: '70014600',
        classTag: 'MULTIHIT.58FUWU.GONGSI',
        tplId: '70014600',
        item_num: '10',
        location: 1,
        start: 0
    }, function (xml) {

        console.log(xml);//XML数据

        return '搬家';//覆盖返回值

    }, function (isTimeout) {

        console.log(isTimeout);//true：超时异常，false：逻辑异常

    });
```

&nbsp;

###Service.ajax(options)
> 在有Zepto/jQuery的情况下才有该方法，该方法将Zepto/jQuery的ajax封装出一套含有异步队列模型的ajax

- options{ Object } - 参考jQuery/Zepto `$.ajax(options)` API

重载

- Service.ajax(options) - 参考jQuery/Zepto相关API


```javascript
    service.ajax({
        url: '/test',
        success: function () {
            return 'linkFly';
        }

    }).ajax({
        url: '/test',
        success: function () {
            console.log(arguments);//[服务器返回数据,'linkFly']
        },
        error: function () {

        }
    });
```

&nbsp;

##逻辑增强

###Service.throttle(func, wait, options)
> 函数节流：节流阀 -  把原函数封装为拥有函数节流阀的函数，当重复调用函数，只有到达这个阀值（wait毫秒）才会执行。  
节流阀主要针对频繁执行的函数。  
例如拖拽元素、滚动条频繁滚动所触发的回调函数。

- func{ Function } - 要封装的回调函数 
- wait{ Int } - 阀值(ms)
- options{ Object } - 配置第一次执行和禁用最后一次执行
 - options.leading{ Boolean } - 是否禁用第一次执行，默认为false
 - options.trailing{ Boolean } - 默认为true，传递false则禁用最后一次执行

重载

- service.throttle(func, wait) - 默认配置
- service.throttle(func, wait,options) - 自定义配置 

```javascript
    var endCount = 0,
        count = 0,
        newFunc = service.throttle(function () {
            count++;
            console.clear();
            console.log(count);//输出5，仅被调用了5次
        }, 1000),
        id;

    id = setInterval(function () {
        newFunc();
        endCount > 60 ?
            clearInterval(id) : endCount++;
    }, 60);



    service.throttle(function () {
        
    }, 200, {
        leading: false,//禁用第一次执行
        trailing: false//禁用最后一次执行
    });
```

&nbsp;

###Service.debounce(func, wait, immediate)
> 函数节流：防反跳 -  把原函数封装为拥有防反跳的函数，延迟函数的执行(wait毫秒)，当重复调用函数时候，只执行最后一个调用（在wait毫秒之后）  
主要是针对某些频繁调用并且仅需要响应最后一次的函数。
例如用户在输入中动态查询结果，节流阀可以限制当用户在指定毫秒内没有再进行输入操作再进行查询，或者在滚动条事件中限制频繁触发的回调函数。

- func{ Function } - 要封装的回调函数
- wait{ Int } - 阀值(ms)
- immediate{ Boolean } - 表示是否逆转模型，为true表示：wait毫秒内的多次调用，仅第一次生效，默认为false

重载

- service.debounce(func, wait) - 默认配置
- service.debounce(func, wait,immediate) - 自定义配置 

```javascript
    var endCount = 0,
        count = 0,
        newFunc = service.debounce(function () {
            count++;
            console.log(count);//输出1，仅执行最后一次
        }, 1000),
        id;

    id = setInterval(function () {
        newFunc();
        endCount > 30 ?
            clearInterval(id) : endCount++;
    }, 60);
```

&nbsp;

###Service.after(count, func, $this)
> 限定函数运行下限次数：封装一个函数，只有在运行了count次之后才有效果  
例如两条JSONP请求都完成了才可以执行，则可以封装回调函数并指定下限为2，只有回调函数执行了两次才可以真正的执行。

- count{ Int } - 次数
- func{ Function } - 要封装的函数 
- $this{ Object } - 函数的this指向，默认为`window`

重载

- service.after(count, func)
- service.after(count, func, $this)

```javascript
    var newFunc = service.after(3, function () {
        console.log('linkFly');
    });
    newFunc();
    newFunc();
    newFunc();//输出linkFly
```

&nbsp;

###Service.before(count, func, $this)
> 限定函数运行上限次数（不含）：封装一个函数，调用不超过count次，超过count次的调用仅返回最后一次调用的结果
例如多个JSONP有着相同的重复的业务逻辑，则可以封装这些逻辑，指定调用次数。

- count{ Int } - 次数（不含该次数）
- func{ Function } - 要封装的函数 
- $this{ Object } - 函数的this指向，默认为`window`

重载

- service.before(count, func)
- service.before(count, func, $this) 

```javascript
    var newFunc = service.before(2, function () {
        console.log('linkFly');
    });
    newFunc();//输出linkFly
    newFunc();//重复调用仅返回最后一次调用的结果
    newFunc();
    newFunc();
```

&nbsp;

###Service.once(func, $this)
> 创建一个仅执行一次的函数，重复调用的方法也没有效果，只会返回第一次执行时的结果  

- func{ Function } - 要封装的函数 
- $this{ Object } - 函数的this指向，默认为`window`

重载

- service.once(func)
- service.once(func, $this)
- 

```javascript
    var newFunc = service.once(function () {
        console.log('linkFly');
    });
    newFunc();//输出linkFly
    newFunc();//重复调用仅返回最后一次调用的结果
    newFunc();
    newFunc();
```

&nbsp;


&nbsp;

##GPS
 
###Service.addr(data)
> 尝试获取本地地址，例：中关村东路1号院，或解析一份数据为本地地址

- data{ Object } - 要解析的数据

重载

- Service.addr() - 尝试从cookie获取，例：中关村东路1号院，获取失败返回null
- Service.addr(data) - 尝试将一组数据转换为本地地址，转换失败返回null

```javascript
    //准备测试
```

&nbsp;

###Service.gps(done, fail, time)
> 发送一条gps请求，为了保证更佳的正确性，请在**DOMReady**中使用。

- done{ Function } - 获取位置成功后执行的回调函数，参数是：本地地址（北京市海淀区中关村1号院）,{ lat:经度 , lon:纬度 } 
- fail{ Function } - 获取位置失败后执行的回调函数，参数是：{ code:错误编码（超时为100）,  message:"错误信息" }
- time{ Int } - 超时时间（ms），默认根据全局配置`Service.config({ gpsTimeout:6000 })` 

重载

- Service.gps(done, time)
- Service.gps(done, fail)
- Service.gps(done, fail, time)

```javascript
    //准备测试
```

&nbsp;

###Service.position()
> 尝试从cookie中获取本地gps（经纬度）信息，如果本地有，返回的对象格式{lat:lat,lon:lon}，否则为null

```javascript
    //准备测试
```

&nbsp;


&nbsp;


##数据中心

###Service.Database(namespace)
> 创建一个工作的数据中心对象，内部通过`localStorage`对象构建

- namespace{ String } - 命名空间


重载

- Service.Database() - 创建一个本地数据中心对象，无命名空间
- Service.Database(namespace) - 创建一个本地数据中心对象，并指定命名空间

```javascript
    var databse = new service.Database();

    var db = service.Database();//无new化

    var db2 = service.Database('service.demo');//指定命名空间
```

&nbsp;

###Database.prototype.val(key, value)
> 获取/存储数据

- key{ String } - 存储的key
- value{ Object } - 存储的值

重载

- Database.prototype.val(key) - 读取，读取的值会尝试进行js数据类型转换
- Database.prototype.val(key, value) - 设置
- Database.prototype.val(obj) - 设置一组

```javascript
    var databse = service.Database('service');//这个对象工作在"service"命名空间下
    //set
    databse.val('name', 'linkFly');
    databse.val('arr', [
                'index0', ['复杂的数组', 'index1-index1', ['index-1-index2-index0', 'index1-index2-index2']]
    ]);
    databse.val('json', { name: 'sogou', text: '一个简单的json对象' });
    databse.val('bool', true);

    //get
    databse.val('name');//"linkFly"
    databse.val('arr');//["index0", ["复杂的数组", "index1-index1", ["index-1-index2-index0", "index1-index2-index2"]]]
    databse.val('json');// Object { name="sogou",  text="一个简单的json对象"}
    databse.val('bool');// true
```

&nbsp;

###Database.prototype.remove(key)
> 移除一个/一组数据项，返回被移除的数据值

- key{ string } - key
- array{ Array } - 由多个key组成的Array

重载

- Database.prototype.remove(key) - 从数据中心移除一个数据
- Database.prototype.remove(array) - 从数据中心移除一组数据

```javascript
    var databse = service.Database('service');
    databse.val('name', 'linkFly');
    databse.val('test', 'one');
    databse.val('test2', 'two');

    databse.remove('name');//"linkFly"
    databse.remove(['test', 'test2']);//["one","two"]
```

&nbsp;

###Database.prototype.clear()
> 清空命名空间下的数据

```javascript
    var databse = service.Database('service');
    databse.val('name', 'linkFly');
    databse.val('test', true);

    databse.clear();// { "service.test":"true" , "service.name":"linkFly" }
```

&nbsp;

###Service.Database.clear()
>  清空整个数据中心，**仅限调试模式下使用**


```javascript
    var service = window.sogou.service;
    //仅限调试模式下使用
    service.config({ debug: true }).Database.clear();
```

&nbsp;


&nbsp;
 
##DOM增强 

###Service.imgLoad(elem, options)
> 加载一张图片，默认配置挂载在`Service.imgLoad.DEFAULTS`

- elem{ HTMLImageElement } - img DOM对象，图片加载都会操作该对象 
- options{ Object } - 配置
 - options.src{ String } - 要加载的图片url
 - options.load{ String } - 加载中显示的图片（如果有elem的话）
 - options.error{ String } - 加载失败显示的图片（如果有elem的话）
 - options.done{ String } - 加载成功后执行的函数，参数是图片url（options.src）
 - options.fail{ String } - 加载失败后执行的函数，参数是图片失败的url（options.error）

重载
- Service.imgLoad(options) - 没有img DOM的操作
- Service.imgLoad(elem, options) - 使用element的`dataset`（如果支持的话）和传递的options作为配置，根据配置完成后自动设置element的src

```javascript
    //Service.imgLoad(elem, options)
    service.imgLoad(document.createElement('img'), {
        src: 'test.jpg'
    });

    //Service.imgLoad(options)
    service.imgLoad({
        src: 'test.jpg',
        load: 'loading.jpg',
        error: 'error.jpg',
        done: function (src) {
            console.log('done', src);
        },
        fail: function (errorUrl) {
            console.log('error', errorUrl);
        }
    });

    //自定义默认配置
    service.imgLoad.DEFAULTS = {
        load: 'newLoad.jpg',
        error: 'newError.jpg'
    };
``` 

&nbsp;

###Service.Support
> 简单的嗅探浏览器特性

```javascript
    console.log(service.Support.onAnimationEnd);//浏览器支持的animationend事件
    console.log(service.Support.onTransitionEnd);//浏览器支持的transitionend事件


    //监听一个animationEnd动画结束事件，如果浏览器不支持，那么就在指定的秒数（第三个参数）后执行
    service.onAnimationEnd(document.createElement('div'), function () {

        console.log('触发onAnimationEnd（动画结束）事件');

    }, 5)//5s

    //同上，监听transitionEnd动画结束事件
    service.onTransitionEnd(document.createElement('div'), function () {

        console.log('触发onTransitionEnd（动画结束）事件');

    }, 3);

``` 

&nbsp;

###Service.animate(elem, properties, duration, ease, callback, delay)
> 简单强悍的动画（不要觉得的又大又重的，核心代码50行）

- elem{ Element }  - 要执行动画的元素 
- properties{ Object|String } - 为Object对应css属性`transition-property`，为String对应css属性`animation-name`
- duration{ Int } - 动画执行时间（s），对应css属性`transition-duration/animation-duration`
- ease{ String } - 动画的速度曲线，对应css属性`animation-timing-function/transition-timing-function`，默认为`linear`。
- callback{ Function } - 动画完成后执行的回调函数
- delay{ Int }  - 动画延迟时间（s），对应css属性`transition-delay/animation-delay`，默认为0 

重载
- Service.animate(elem, properties, duration)
- Service.animate(elem, properties, duration, delay)
- Service.animate(elem, properties, duration, callback, delay)
- Service.animate(elem, properties, duration, ease, callback, delay)

```javascript
    service.animate(document.getElementById('translate'),
                    {
                        transform: 'translate3d(500px,0,0)'
                    },
                    3,//动画运行时间
                    1,//动画延时
                    function () {
                        console.info('translate() - 动画完成');
                    });


    service.animate(document.getElementById('leftElem'),
                    {
                        left: 500
                    }, 3,

                    //指定动画曲线
                    'ease-in-out');


    service.animate(document.getElementById('animaElem'),

                    //传递animation-name
                    'demoAnimation',

                    3,
                    function () {
                        console.info('animation() - 动画完成');
                    });


    //完整的参数
    service.animate(document.getElementById('moreElem'),
                    //动画目标属性
                    {
                        'transform': 'rotate(720deg)', //支持多属性
                        'background-color': '#ffe48e',
                        left: 500
                    },

                    //动画运行时间（s）
                    3,

                    //动画曲线
                    'ease-in-out',

                    //动画完成后的回调函数
                    function () {

                        console.info('多属性 - 动画完成');

                    },

                    //动画延时(s)
                    1)
``` 

&nbsp;