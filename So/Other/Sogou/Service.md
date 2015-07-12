#Service.js 帮助

> Service.js是对服务体系增强的一套基础类库，支持AMD规范。  
核心目标是把服务中常用的工具集成进来，并给一些模块化的组件提供基础工具。  
Service.js的模块结构如下：
- 基础工具
- 服务模块（异步加载）
- 逻辑增强
- GPS
- 数据中心
- DOM增强


##目录
- 基础工具
 - 使用
 - 核心和内部工具
 - Service.config - 配置
 - Service.format - 格式化字符串
 - Service.parseData - 转换字符串为js中的基础数据类型
 - Service.byteLength - 检测字符串byte长度
 - Service.truncate - 裁剪字符串
 - Service.parseDate - 转换日期
 - Service.dateFormat - 格式化日期
 - Service.dateToLocal - 本地化日期
 - Service.param - 编码对象
 - Service.Search - 获取url参数
 - Service.cookie - 读取/设置cookie
 
- 服务模块（异步加载,二次加载）
 - Service.qo - 获取qo一个对象
 - Service.CallBacks - 异步队列 
 - Service.getJSONP - JSONP请求
 - Service.defer - 异步队列的JSONP请求 
 - Service.fetch - 异步队列的二次加载 
 - Service.request - 传统的二次加载
 - Service.ajax - 异步队列的ajax 
 
- 逻辑增强
 - Service.createEnum - 枚举 
 - Service.throttle - 函数节流：节流阀
 - Service.debounce - 函数节流：防反跳
 - Service.after - 限定函数运行下限次数
 - Service.before - 限定函数运行上限次数
 - Service.once - 构建一次性函数
 
- GPS 
 - Service.addr - 获取本地地址
 - Service.gps - 发送gps请求
 - Service.position - 获取本地gps（经纬度）信息
 
- 数据中心
 - Service.Database - 创建一个在指定命名空间下工作的数据中心对象
 - Database.prototype.val - 获取/存储数据
 - Database.prototype.remove - 移除数据
 - Database.prototype.clear - 清空命名空间下的数据
 - Service.Database.clear - 清空数据中心
 
- DOM增强 
 - Service.imgLoad - 图片加载
 - Service.Support - 浏览器支持
 - Service.animate - 动画
 
 
 ###基础工具
 
 ####使用
 
 service注册在`window.sogou.service`，全局访问，同时支持AMD规范，AMD中访问模块名为`service`。
 
 ```javascript
 	window.sogou.service.config({ debug: true });//全局访问
	//AMD访问
	require(['service'], function (service) {
        service.config({ debug: true });
    });
 ```
 
**下面所有的代码中都使用AMD下的变量名service作为演示，变量`service`都代表全局对象`window.sogou.service`。**

 
 ####核心和内部工具
 
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
	
	//循环
    service.each(['a'], function (value, i) {
        console.log(value, i);//a,0
    })
	service.each({ author: 'linkFly' }, function (key, value) {
        console.log(key, value);//author,linkFly
    })
	
	//根据原数组/类数据生成新的数组，类似但强于Array.prototype.map ECMAScript 5(ES5)规范
	service.map(['a', 'b'], function (value, i) {
            return i;
    });// [0, 1]
	
	
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
    service.tick(function () {
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

####Service.config(options)
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

####Service.format(str, object)
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

####Service.parseData(value)
> 转换一个字符串为js中的基础数据类型

```javascript
	service.parseData('{ name: "linkFly", run: function () { console.log(this.name); } }');//{ name: "linkFly", run: function () { console.log(this.name); } }
    service.parseData('true')//true
    service.parseData('null')//null
```

&nbsp;

####Service.byteLength(target,fix)
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

####Service.truncate(target, length, truncation, isByte)
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

####Service.parseDate(jsonDate)
> 转换一个时间戳或序列化的时间戳为Date对象

- jsonDate：时间戳[1436677646736]或序列化后的时间戳[/Date(1436677646736)/]

重载：
- service.parseDate(jsonDate) - 时间戳转换
- service.parseDate(serializeDate) - 序列化时间戳转换

```javascript
    service.parseDate(1436677646736);
    service.parseDate('/Date(1436711484349)/');
```

&nbsp;

####Service.dateFormat(jsonDate, format) - 格式化日期
> 格式化一个时间戳/Date/序列化时间戳为指定的格式

- jsonDate{ Date | jsonDate | timespan } - 要格式化的时间戳/Date对象/序列化时间戳
- format{ String } - 格式化

> 格式化格式例如：`yyyy年MM月dd日 HH:mm:ss`，则会格式出：`2015年7月12日 20:51:19`，所以格式如下：  
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

####Service.dateToLocal(oldDate, nowDate)
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


####Service.param(obj, deep)
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

####Service.Search(url)
> 注意，获取url参数，`service.Search`是一个对象，它支持静态获取参数的，之所以提供动态获取是因为DOM3的API `pushState`支持无刷新修改url参数。

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


####Service.cookie(name, value, expiredays)
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

###服务模块
####Service.qo(options)
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

####Service.CallBacks()
> 一个强大的异步队列控制对象，内置在[deferJsonp](https://github.com/linkFly6/deferJsonp)中。  
传统的异步任务没有队列的概念，Service内置了Callbacks工作对象，用于控制异步任务的队列，让无序的异步任务有序的执行。  
尤其在ajax/JSONP中，利用浏览器最大HTTP线程，最快发送异步请求，最短且有序的响应。

重载

- Callbacks.prototype.add(callback) - 传入一个回调函数，把它加入任务队列中，并返回一个函数id
- Callbacks.prototype.done(id) - 根据id找到对应的函数并执行，执行条件是在这个函数前面的任务队列已经没有其他任务了


```javascript


```

&nbsp;

####Service.getJSONP(url, done, fail, time)
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

```

&nbsp;

####Service.defer(url, done, fail, time)
> 发起一个异步队列的JSONP请求，它的回调函数执行时机依赖上一个JSONP的函数执行与否。

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

```

&nbsp;

####Service.fetch(qo, success, error, time)
> 发起一个含有异步队列模型的二次加载，所有的自定义配置都会和默认配置进行合并，没有填写的属性将采用默认属性值

- qo{ Object } - qo对象，参考`service.qo(options)`，会和默认qo配置对象进行合并
- success{ Function } - 异步加载成功后执行的回调函数，它的第一个参数是JSONP返回的数据，后续的参数在过去全部所有异步队列模型合并的参数
- error{ Function } - 异步加载失败后执行的回调函数，第一个参数如果是为`false`，则表示逻辑错误，为`true`则表示超时错误，后续的参数同上
- time{ Int } - 超时时间（ms），默认为全局配置`service.config({ timeout : 16e2 })`
- options{ Object } - 传递`options`则表示完整配置整个二次加载，它包含这些属性
 - options.url{ String } - 请求url，默认为全局配置`service.config({ url : "/web/features/vr.jsp?keyword=${1}&qoInfo=${0}&cb=?" })`
 - options.keywords{ String } - 请求关键词（keywords），默认为"sogou"，在url中使用`${1}`作占位符
 - options.filter{ Boolean } - 是否过滤数据，默认二次请求加载的XML数据都会进行验证数据正确性，验证不通过则触发`options.error`，默认为true
 - options.success{ Function } - 二次加载请求成功后执行的回调函数
 - options.error{ Function } - 二次加载请求失败后执行的回调函数
 - options.time{ Int } - 超时时间（ms），默认为全局配置`service.config({ timeout : 16e2 })`
 - options.qo{ Object } - qo对象，参考`service.qo(options)`，会和默认qo配置对象进行合并


重载
- Service.fetch(qo) - 传入qo，通过识别qo中是否含有属性`tplId`实现
- Service.fetch(qo, success) - 传入成功后执行的回调函数，采用全局默认JSONP超时时间设置
- Service.fetch(qo, success, error) - 传入失败后执行的回调函数
- Service.fetch(qo, success, time) - 传入超时时间（ms）
- Service.fetch(qo, success, error, time) - 传入完整qo配置
- Service.fetch(options) - 传入完整请求配置对象

```javascript

```

&nbsp;

####Service.request(qo, success, error, time)
> 和`service.fetch()` API一致，只是它的请求是无序的（没有异步队列模型）

```javascript

```

&nbsp;

####Service.ajax(options)
> 在有Zepto/jQuery的情况下才有该方法，该方法将Zepto/jQuery的ajax封装出一套含有异步队列模型的ajax

- options{ Object } - 参考jQuery/Zepto `$.ajax(options)` API

重载

- Service.ajax(options) - 参考jQuery/Zepto相关API


```javascript

```

&nbsp;

 