#Service.vr.js 帮助文档

> Service.vr.js是之前Service.js的VR版，是对VR基础功能体系增强的一套基础类库，支持AMD规范。  
核心目标是把服务中常用的工具集成进来，并给一些模块化的组件提供基础工具。  
如果觉得这份文档仍然不够详尽，可以参考源码注释，基本上每个曝露的API都文档注释了。

Service.vr.js的模块结构如下：
- 基础工具
- 逻辑增强
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
 - [Service.$apply - 方法转接](##serviceapplycallback-args-this)
 - [Service.param - 编码对象](#serviceparamobj-deep)
 - [Service.search - 获取url参数](#servicesearchurl)
 - [Service.cookie - 读取/设置cookie](#servicecookiename-value-expiredays)

- [逻辑增强](#逻辑增强)
 - [Service.throttle - 函数节流：节流阀](#servicethrottlefunc-wait-options)
 - [Service.debounce - 函数节流：防反跳](#servicedebouncefunc-wait-immediate)
 - [Service.after - 限定函数运行下限次数](#serviceaftercount-func-this)
 - [Service.before - 限定函数运行上限次数](#servicebeforecount-func-this)
 - [Service.once - 构建一次性函数](#serviceoncefunc-this)

- [数据中心](#数据中心)
 - [Service.Database - 创建一个在指定命名空间下工作的数据中心对象](#servicedatabasenamespace)
 - [Database.prototype.val - 获取/存储数据](#databaseprototypevalkey-value)
 - [Database.prototype.remove - 移除数据](#databaseprototyperemovekey)
 - [Database.prototype.clear - 清空命名空间下的数据](#databaseprototypeclear)
 - [Service.Database.clear - 清空数据中心](#servicedatabaseclear)

- [DOM增强](#呵呵) 
 - [Service.Support - 浏览器支持](#servicesupport)
 - [Service.animate - 动画](#serviceanimateelem-properties-duration-ease-callback-delay)
 
- [更新](#更新)
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
> 进行全局自定义配置

```javascript
    service.config({
		debug: false//是否调试模式
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


###Service.$apply(callback, args, $this)
> 模拟Function.prorotype.apply  
当arg.length<=3，会通过call来提升性能和速度，当args.length>3的时候将调用原生apply

- callback：回调函数
- args：参数（数组）
- $this：函数中this的指向

重载：
- service.$apply(callback, args) - 方法转接
- service.$apply(callback, args, $this) - 指定this

```javascript
    service.$apply(function(){
        console.log(arguments);//[0,1]
        
    },[0,1]);
```

&nbsp;




###Service.param(obj, deep)
> 编码一个对象（为url），注意编码的对象如果有function也会被编码，通过调用`encodeURIComponent`进行编码

- obj{ Object } - 要编码的对象
- deep{ Boolean } - 是否深度编码（当一个对象包含子对象的时候，是否也编码这个子对象），默认为true

重载：
- service.param(obj) - 编码一个对象（为url）
- service.param(obj, deep) - 编码一个对象，并指定是否深度编码

```javascript
    service.param({ name: 'linkFly', say: '大家好' });//name=linkFly&say=%E5%A4%A7%E5%AE%B6%E5%A5%BD
    service.param({ name: 'linkFly', qo: { say: '大家好' } });//name=linkFly&say%3D%25E5%25A4%25A7%25E5%25AE%25B6%25E5%25A5%25BD
```

&nbsp;

###Service.search(url)
> 获取url中的参数

- url{ String } - 要获取参数的url，默认为`window.location.search`

重载：
- Service.search() - 动态获取当前页面url的参数
- Service.search(url) - 动态获取指定url的参数 

```javascript
    service.search('/fuwu/test/index.html?name=linkFly&type=%E6%B5%8B%E8%AF%95');//Object {name: "linkFly", type: "测试"}
```

&nbsp;


###Service.cookie(name, value, expiredays)
> 读取/设置cookie

- name - 读取/设置的cookie名称
- value - 设置的cookie值
- expiredays - 过期时间（天）

重载：
- Service.cookie() - 读取所有的cookie，返回JSON对象
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
    service.cookie();// all cookie
    service.cookie('test');// Object { name="linkFly",  say="大家好"}
    service.cookie('name');//'linkFly'
    service.cookie('demo');//true
    service.cookie('null');//""
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

&nbsp;
 
##更新
 
###2015-11-19
- 从service.js代码中抽离出service.vr.js
  - 移除了`dateFormat`、`dateToLocal`、`log`、`padNumber`、`imgLoad` API。
  - 移除了`GPS`、`二次（异步）加载`模块
  - 新增了`$apply` API

&nbsp;

###2015-7-13
- 创建了service.js

