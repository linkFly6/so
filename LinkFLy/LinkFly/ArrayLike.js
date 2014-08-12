(function () {
    var number = 1;
    !function () {
        //通过继承数组实现，数组原生方法会被继承过来
        var List = function () { };
        List.prototype = [];
        List.prototype.constructor = List;
        List.prototype.add = function (item) {
            this.push(item);
        };
        //测试
        console.group('第 ' + (number++) + ' 种Array-Like测试');
        var demo = new List();
        //源于继承
        demo.push('Array - push()');
        demo.add('List - add()');
        console.log('demo instanceof List ： %c' + (demo instanceof List), 'color:blue;');
        console.log('demo.constructor === List ：%c' + (demo.constructor === List), 'color:blue');
        console.log('[ ' + demo[0] + ' , ' + demo[1] + ' ]');
        console.log('length：' + demo.length);
        console.groupEnd();
    } ();

    !function () {
        //通过自动维护length实现
        var List = function () {
            this.length = 0;
        };
        List.prototype.add = function (item) {
            this[this.length++] = item;
        };
        console.group('第 ' + (number++) + ' 种Array-Like测试');
        var demo = new List();
        demo.add('List - add()');
        console.log('demo instanceof List ： %c' + (demo instanceof List), 'color:blue');
        console.log('demo.constructor === List ：%c' + (demo.constructor === List), 'color:blue');
        console.log('[ ' + demo[0] + ' , ' + demo[1] + ' ]');
        console.log('length：' + demo.length);
        console.groupEnd();

    } ();

    !function () {
        //第三种Array-Like
        var List = function () {
            var self = {
                constructor: List,
                length: 0,
                add: function (item) {
                    [ ].push.call(this, item);
                }
            };
            return self;
        };
        console.group('第 ' + (number++) + ' 种Array-Like测试');
        var demo = new List();
        demo.add('List - add()');
        console.log('demo instanceof List ： %c' + (demo instanceof List), 'color:red;'); //但是demo的原型链上检测不到List.prototype
        console.log('demo.constructor === List ：%c' + (demo.constructor === List), 'color:blue');
        console.log('[ ' + demo[0] + ' , ' + demo[1] + ' ]');
        console.log('length：' + demo.length);
        console.groupEnd();
    } ();


    !function () {
        //我们看见上面那种instanceOf并不能返回正确的结果，于是我们修正它
        var List = function () {
            /*
            instanceof 检测一个对象A是不是另一个对象B的实例的原理是：
            查看对象B的prototype指向的对象是否在对象A的[[prototype]]链上。
            如果在，则返回true,如果不在则返回false。
            不过有一个特殊的情况，当对象B的prototype为null将会报错(类似于空指针异常)。
            reference:http://kb.cnblogs.com/page/77478/
            */
            self = {
                constructor: List,
                length: 0,
                prototype: List.prototype,
                add: function (item) {
                    [ ].push.call(this, item);
                }
            };
            return self;
        };
        console.group('第 ' + (number++) + ' 种Array-Like测试');
        var demo = new List();
        demo.add('List - add()');
        console.log('%cprototype的对比：' + (self.prototype === List.prototype), 'color:red'); // 为什么是false
        console.log('demo instanceof List ： %c' + (demo instanceof List), 'color:red;'); //但是他们仍然不相等
        console.log('demo.constructor === List ：%c' + (demo.constructor === List), 'color:blue');
        console.log('[ ' + demo[0] + ' , ' + demo[1] + ' ]');
        console.log('length：' + demo.length);
        console.groupEnd();
    } ();

    //jQuery
    !function () {
        //jQuery Array-Like实现
        var jQuery = function () {
            return new jQuery.fn.init();
        };
        jQuery.fn = jQuery.prototype = {
            constructor: jQuery,
            length: 0,
            add: function (item) {
                //使用Array.prototype.push添加元素，会自动维护length
                Array.prototype.push.call(this, item);
            }
        };
        jQuery.fn.init = function () {
            return this;
        };
        //漂亮的重置prototype
        jQuery.fn.init.prototype = jQuery.fn;
        console.group('第 ' + (number++) + ' 种，jQuery Array-Like测试');
        var demo = new jQuery();
        demo.add('List - add()');
        console.log('demo instanceof jQuery ： %c' + (demo instanceof jQuery), 'color:blue');
        console.log('demo.constructor === jQuery ： %c' + (demo.constructor === jQuery), 'color:blue');
        console.log('[ ' + demo[0] + ' , ' + demo[1] + ' ]');
        console.log('length：' + demo.length);
        console.groupEnd();
    } ();

    //最简单的类数组实现
    !function () {
        var List = function () { };
        List.prototype = {
            constructor: List,
            length: 0,
            add: function (item) {
                Array.prototype.push.call(this, item);
            }
        };
        console.group('第 ' + (number++) + ' 种Array-Like测试');
        var demo = new List();
        demo.add('List - add()');
        console.log('demo instanceof List ： %c' + (demo instanceof List), 'color:blue;'); //但是他们仍然不相等
        console.log('demo.constructor === List ：%c' + (demo.constructor === List), 'color:blue');
        console.log('[ ' + demo[0] + ' , ' + demo[1] + ' ]');
        console.log('length：' + demo.length);
        console.groupEnd();
    } ();
})();
