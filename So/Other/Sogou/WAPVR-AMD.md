#无线VR模块化集成文档

> 无线VR集成了RequireJS，这份文档主要说明如何用RequireJS编写自己的需求，以及RequireJS相关注意事项。  
> 后续内部编写的相关插件/组件都会朝着这篇文章集成。

##目录

- [RequireJS](#requirejs)
 - [使用](#使用)
 - [define([id], [dependencies], factory)](#defineid-dependencies-factory)
 - [require([module], callback)](#requiremodule-callback)
 - [require.config](#requireconfig)
 - [编写规范](#编写规范)
- [RequireJS插件](#requirejs插件)
 - [Text](#text)
- [插件化](#插件化)
 - [插件列表](#插件列表)
- [组件化](#组件化) 
- [Q&A](#qa) 
- [后续方向](#后续方向)
 - [强模块化](#强模块化)
 - [组件化](#组件化-1)
 - [工程化](#工程化)
- [更新](#更新)
&nbsp;
 
 
##RequireJS
 
###使用
 
 requireJS会在全局环境下注册三个函数：`require`、`define`和`requirejs`，其中`requirejs`是`require`函数的别名。
 
 - define([id], [dependencies], factory) - 定义一个模块
 - require([module], callback) - 获取一个/组模块，成功后执行callback

###define([id], [dependencies], factory)
定义一个模块：
- id：定义的模块名称，可略参数。如果没有，则为匿名模块，关于匿名模块定义条件请参阅[模块定义的条件]。
- dependencies：模块的依赖，可略参数。
- factory：模块代码，返回值是模块
 
```javascript
    //#1定义一个模块，名称叫做vr、依赖zepto模块
    define('vr', ['zepto'], function ($) {
        console.log($);//获取依赖的模块zepto
        return {//返回这个模块内容
            name: 'linkFly'
        }
    });
    
    //#1定义一个模块，名称叫做vr、无依赖
    define('vr', function ($) {
        return {//返回这个模块内容
            name: 'linkFly'
        }
    });
    
    //#3定义一个匿名模块，无依赖
    define(function () {
        return function () {
            return 'linkFly';
        }
    });

```

&nbsp;

###require([module], callback)
> 获取一个/组模块，成功后执行回调函数
- module - 依赖的模块列表
- callback - 依赖模块加载后执行的回调函数

```javascript
    //依赖zepto和vr模块，当zepto和vr模块加载完毕了之后执行callback
    require(['zepto', 'vr'], function ($, vr) {
        console.log(vr.name);//linkFly
    })
```

> 依赖的模块名称优先查找`require.config`里面的配置和当前已经定义(define)的所有模块，如果没有配置相关模块，则会尝试从当前目录（baseUrl）发送Http请求加载。  
例如没有配置和定义zepto模块，而`require.config`默认配置的路径是`/resource/js/`：

```javascript
    //依赖的zepto会从默认路径/resource/js/zepto.js 加载
    require(['zepto'], function ($) {
        console.log(zepto);
    });
```

**require()的执行会首先查找配置，再查找已经定义的模块列表，最后使用文件路径来加载模块。**

&nbsp;

###require.config
> 配置requireJS的工作细节和相关模块配置

- baseUrl：配置requireJS的工作空间/路径，所有模块都相对于该路径查找  
  例如定义了`baseUrl`在`/resource/vr/5/js/`，则所有模块都相对于该路径工作。
- paths：配置模块的路径、备用路径、相当于给模块取别名
- shim：用于配置那些并不支持AMD定义(define)的模块，即配置兼容不遵循AMD规范的库，使用shim配置他们的依赖关系和全局变量
- map：用于配置不同的模块版本
- urlArgs：为每个模块请求加上版本号（请求后缀参数），用于避免模块更新而浏览器的缓存导致并没有加载最新的模块

配置示例：
```javascript
    require.config({
        //版本号
        urlArgs: 'v=0.1', //模块请求示例：/resource/vr/5/js/foo.js?v=0.1
        
        //模块主路径
        baseUrl: '/resource/vr/5/js/',
        
        //配置模块路经/别名
        paths: {
            //相对baseUrl路经
            'avalon': '../../../fuwu/js/comm/avalon.mobile.min',
    
            //也可以重写版本号
            'service': '../../../fuwu/js/comm/service.min.js?version=123',
    
            //绝对路径
            'zepto': '/js/zepto.min.v1.1.5',
    
            'x': '../X.min',
            
            //配置sogouLogin别名
            'sogouLogin': '../../../fuwu/js/sogouLogin'
        },
        shim: {
            //配置underscore的模块兼容，underscore曝露的全局变量是window._
            'underscore': {
                exports: '_'
            },
            
            //配置sogouLogin的模块兼容，曝露的全局变量为window.sogou.sogouLogin
            'sogouLogin': {
                exports: 'sogou.sogouLogin'
            }
        },
        map: {
            //配置所有模块请求zepto的模块为版本1.1.3
            '*': {
                'zepto': 'Zepto.1.1.3'
            },
            ///resource/fuwu/test.js模块请求的zepto为zepto.1.1.4
            '/resource/fuwu/test': {
                'zepto': 'Zepto.1.1.4'
            }
        }
    });

```


&nbsp;

###编写规范
> 使用了AMD模块化规范，则应该遵循模块化编写，包括VR模块化的编写和插件模块化的编写：

1. VR模块化编写  
  
>  VR的业务，可以直接require()得到所有依赖的模块后编写，也可以先`define`一个VR的模块，然后通过`require`调用这个模块。

```javascript
    //#1.直接请求依赖的模块，编写VR业务逻辑
    require(['zepto', 'underscore'], function ($, _) {
        var classid = '<xsl:value-of select="/DOCUMENT/item/classid"/>',//XPath
            rank = '${i}',
            getID = function () {
                return ['sogou_vr_', classId, '_', rank, value ? '_' + value : ''].join('');
            }
        //dosomething
    })
    
    
 
    //#2逻辑分离的写法 - 文件vr700054900.js
    define('vr700054900', ['zepto', 'undercore'], function ($, _) {
        //返回VR逻辑处理
        return function (classId, rank) {
            var getId = function () {
                return ['sogou_vr_', classId, '_', rank, value ? '_' + value : ''].join('');
            };
            //dosomething
        }
    });
    //入口JS中，直接请求VR模块，传入相应的数据
    require(['vr700054900'], function (main) {
        
        var classid = '<xsl:value-of select="/DOCUMENT/item/classid"/>',//XPath
            rank = '${i}';
        main(classid, rank);
    });
```

**值得注意的是，因为requireJS请求的模块只有一个实例，所以当一个页面有多个VR引用同一个业务处理的模块的时候，时刻警惕当前闭包环境是公用的！**

2. 插件模块化编写

> 插件的模块化尽可能多考虑当前环境

```javascript
    /*!
    * Copyright 2015 linkFLy - http://www.cnblogs.com/silin6/
    * Released under the BSD license
    * http://opensource.org/licenses/BSD-3-Clause
    * Help document：http://wap.sogou.com
    * Date: 2015-10-30 15:37:53
    */
    (function (global, factory) {
        if (typeof module === "object" && typeof module.exports === "object") {
            //node/commonJs
            module.exports = global.document ?//依赖document
    			factory(global, true) :
    			function (w) {
    			    if (!w.document) {
    			        throw new Error("foo requires a window with a document");
    			    }
    			    return factory(w);
    			};
        } else {
            //browser
            factory(global);
        }
    })(typeof window !== 'undefined' ? window : this, function (window, noGlobal) {
        'use strict';
    
        //编写插件相关代码
        function Foo() { }
    
        //dosomething...
    
    
        //兼容AMD，定义模块
        if (typeof define === "function" && define.amd) {
            define("foo", [], function () { //AMD
                return Foo;
            });
        }
        
        //默认尝试暴露到全局环境，除非该插件非常重要，否则并不推荐
        if (noGlobal !== true) {
            window.sogou = window.sogou || {};
            if (!window.sogou.foo)
                window.sogou.foo = Foo;
        };
    
        return Foo;
    });
```


插件的编写尽可能遵循以下特性：
1. 逻辑和页面的代码尽可能拆开，后续推组件化的时候可以更好的整合
2. 可配置性高、参阅Bootstrap插件、支持options和dataset配置
3. 尽可能与页面无关
4. 基于对象工作
5. API简洁了然、set/get一体


&nbsp;


##RequireJS插件

> requireJS支持插件，这是完整的插件列表：  
 [https://github.com/jrburke/requirejs/wiki/Plugins](https://github.com/jrburke/requirejs/wiki/Plugins)

> 当前通过基础品质团队将插件集成在了页面上，如果需要再集成其他插件请联系基础品质的童鞋，当前继承了text!插件。   
  requireJS的插件都是通过`!`号来标识插件的，调用方式为`插件名!模块Id/路经`：
  
 
###Text

> text插件用于加载各种静态资源（**采用Xhr实现，基于同源策略，不允许跨域的资源**），支持html、css、txt。

```javascript
    //请求文本
    require(['text!/js/test.txt'],function(css){
              console.log(css);//String => text.txt的文本内容
    });
    
    //请求css
    require(['text!/resource/web/css/vr_overwrite.min.css'],function(css){
              console.log(css);//String => vr_overwrite.min.css的文本内容
    });
    
```

&nbsp;

&nbsp;

##插件化

###插件列表
> 这份列表列出了当前组里所有的插件项目和模块名：


1. Zepto.js    
 - 模块名：zepto
 - 兼容性：mobile
 - 介绍：DOM基础操作
 
2. jQuery.imgLoad.js
 - 模块名：文件名
 - 兼容性：IE6+
 - 介绍：图片加载/预加载/懒加载
 
3. sogouGps.m.js
 - 模块名：sogouGps
 - 兼容性：mobile
 - 介绍：搜狗GPS通用插件
 
4. [X.js](https://github.com/linkFly6/X)
 - 模块名：x
 - 兼容性：mobile
 - 介绍：XML操作
 
5. sogouLogin.js
 - 模块名：sogouLogin
 - 兼容性：mobile
 - 介绍：搜狗登录插件
 
6. 谜の类库，编写中
 - 模块名：编写中
 - 兼容性：编写中
 - 介绍： 编写中

&nbsp;

##组件化

> 待定

&nbsp;

##Q&A
**Q:有些代码需要DOMReady才可以加载，如何保证代码在DOMReady后加载呢？**

A:使用基础模块Zepto的DOMReady
```javascript
require(['zepto'],function($){
    $(function(){
        //DOM Ready,dosomething
    });
});
```

**Q:什么是匿名模块？什么是命名模块？如何定义呢？**

A:两种模块的定义方式不同。

外链的js文件尽可能使用匿名模块,这样模块名可以十分灵活，通过`require.config`的`paths`可以自由配置任意模块名，是**官方推荐**写法：
```javascript
    //anonModuleDemo.js、匿名模块，依赖jquery模块
    define(['jquery'], function ($) {
        return function () {
            console.log('匿名模块', $);
        }
    });   
    
    //页面中使用
    require(['anonModuleDemo'], function (func) {
        func();//匿名模块 function(selector, context)
    })
   
```

而命名模块多用于页面中直接定义的模块，因为是在页面中直接定义的，没有独立的文件，所以无法通过文件名识别模块，**因此在(HTML)页面中，无法直接定义匿名模块**。

```html
    <script>
        //定义一个名为demo的模块，依赖jquery模块
        define('demo', ['jquery'], function ($) {
            return function () {
                console.log('命名模块', $);
            }
        });
        //调用这个命名模块
        require(['demo'], function (func) {
            func();//命名模块 function(selector, context)
        })
    </script>
```


**Q:定义的模块什么时候执行呢？**

A:AMD强调优先执行，**当模块被请求(require)，且加载完成后，会立即执行**，如果：
```javascript
    define('demo', function () {
        console.log('1');
        return function () {
            console.log('2');
        }
    });
    require(
        ['demo'],//当demo模块加载完成了之后立即执行
        function (demo) {
            //调用demo的时候，输出2
        });
```
requireJS还有另外一个模块依赖的写法，名义上是延迟执行，本质上仍然是立即执行，只不过写法上更加的贴近NodeJS中的CommonJS模块化规范：
```javascript
    define('demo', function (require, exports, module) {
        //延迟执行
        var $ = require('jquery');
        //曝露方法
        exports.get = function () {
            console.log('linkFly');
        }
    });

    require(['demo'], function (demo) {
        demo.get();//输出linkFly
    });
```

&nbsp;


&nbsp;

##后续方向

###强模块化
> 基于文件编写代码，js、css、html、图片都进行分离，通过编译工具（例如grunt）工具将所有外链的js、css、图片（base64）都合并编译成内联的，并且通过编译工具进行更佳的版本策略管理。

###组件化
> 注入组件化语法，注入新的HTML标签，通过工具编译把标签转换（例子仅供参考）：

```html
    <!--编译前：自定义标签，通过属性自定义组件的配置（配置参数）-->
    <sogou-gps data-id="gpsBox" data-search="yes"/>
    
    
    
    <!--编译后，通过参数配置了id、是否显示搜索框-->
    <div class="sogou-gps" id="gpsBox" data-version="1.0">
        <!--自动编译进css和js-->
       <style>
           .sogou-gps{ border:1px solid #CCC; }
       </style>
      <input placeholder="请输入地点" /><input value="搜索"/>
      <div class="searchBox"><!--搜索列表--></div>
      <script>
          define('sogouGps',function(){
               return {
                    gps:function(){ },
                    addr:function(){ }
               };
          });
      </script>
    </div>
```


###工程化
> 尝试通过`Reactjs`混合HTML+JS来编写业务、集成组件化，本地环境一键压缩、编译、部署。



&nbsp;

&nbsp;

 
##更新 

###2015-10-30
- 创建

