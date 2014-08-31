(function () {
    var number = 1;
    !function () {
        //通过闭包实现
        var List = function () {
            var list = [],
                self = {
                    constructor: List,
                    //如果希望更像原生一点，将length定义为属性，那么length则需要自己维护
                    length: function () { return list.length; },
                    add: function (item) {
                        list.push(item);
                    },
                    eq: function (index) {
                        return list[index];
                    }
                };
            return self;
        };
        //测试
        console.group('第一种 - 通过闭包实现');
        var demo = new List();
        demo.add('List - add()');
        console.log('demo instanceof List ： %c' + (demo instanceof List), 'color:red;');
        console.log('demo.constructor === List ：%c' + (demo.constructor === List), 'color:blue');
        //无法通过索引demo[0]这种方式访问
        console.log('成员：[ ' + demo.eq(0) + ' , ' + demo.eq(1) + ' ]');
        console.log('length：' + demo.length());
        //注意看demo对象
        console.log(demo);
        console.groupEnd();
    }();

    !function () {
        //通过继承数组实现，数组原生方法会被继承过来
        var List = function () { };
        List.prototype = [];
        List.prototype.constructor = List;
        List.prototype.add = function (item) {
            this.push(item);
        };
        //测试
        console.group('第二种 - 通过继承实现');
        var demo = new List();
        //源于继承
        demo.push('Array - push()');
        demo.add('List - add()');
        console.log('demo instanceof List ： %c' + (demo instanceof List), 'color:blue;');
        console.log('demo.constructor === List ：%c' + (demo.constructor === List), 'color:blue');
        console.log('[ ' + demo[0] + ' , ' + demo[1] + ' ]');
        console.log('length：' + demo.length);
        //注意看demo对象
        console.log(demo);
        console.groupEnd();
    }();

    !function () {
        //通过自动维护length实现
        var List = function () {
            this.length = 0;
        };
        List.prototype.add = function (item) {
            //让对象模拟Array的行为
            this[this.length++] = item;
        };
        console.group('第三种 - 通过自我维护实现');
        var demo = new List();
        demo.add('List - add()');
        console.log('demo instanceof List ： %c' + (demo instanceof List), 'color:blue');
        console.log('demo.constructor === List ：%c' + (demo.constructor === List), 'color:blue');
        console.log('[ ' + demo[0] + ' , ' + demo[1] + ' ]');
        console.log('length：' + demo.length);
        //注意看demo对象
        console.log(demo);
        console.groupEnd();
    }();

    !function () {
        //第四种Array-Like
        var List = function () {
            var self = {
                constructor: List,
                length: 0,
                add: function (item) {
                    //本质在这里，交给Array的自动维护
                    [].push.call(this, item);
                }
            };
            return self;
        };
        console.group('第四种 - 针对第一种优化');
        var demo = new List();
        demo.add('List - add()');
        console.log('demo instanceof List ： %c' + (demo instanceof List), 'color:red;');
        console.log('demo.constructor === List ：%c' + (demo.constructor === List), 'color:blue');
        console.log('[ ' + demo[0] + ' , ' + demo[1] + ' ]');
        console.log('length：' + demo.length);
        console.log(demo);
        console.groupEnd();
    }();

    !function () {
        //第五种，我们看见上面那种instanceOf并不能返回正确的结果，于是我们修正它
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
                //强制引用__proto__,IE并不支持
                __proto__: List.prototype,
                add: function (item) {
                    Array.prototype.push.call(this, item);
                }
            };
            return self;
        };
        console.group('第五种 - 修复instenceOf判定');
        var demo = new List();
        demo.add('List - add()');
        console.log('demo instanceof List ： %c' + (demo instanceof List), 'color:blue;'); //但是他们仍然不相等
        console.log('demo.constructor === List ：%c' + (demo.constructor === List), 'color:blue');
        console.log('[ ' + demo[0] + ' , ' + demo[1] + ' ]');
        console.log('length：' + demo.length);
        console.log(demo);
        console.groupEnd();
    }();

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
        console.group('第六种 - jQuery的实现');
        var demo = new jQuery();
        demo.add('List - add()');
        console.log('demo instanceof jQuery ： %c' + (demo instanceof jQuery), 'color:blue');
        console.log('demo.constructor === jQuery ： %c' + (demo.constructor === jQuery), 'color:blue');
        console.log('[ ' + demo[0] + ' , ' + demo[1] + ' ]');
        console.log('length：' + demo.length);
        console.log(demo);
        console.groupEnd();
    }();

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
        console.group('第七种 - 最简单的实现');
        var demo = new List();//只是需要new
        demo.add('List - add()');
        console.log('demo instanceof List ： %c' + (demo instanceof List), 'color:blue;'); //但是他们仍然不相等
        console.log('demo.constructor === List ：%c' + (demo.constructor === List), 'color:blue');
        console.log('[ ' + demo[0] + ' , ' + demo[1] + ' ]');
        console.log('length：' + demo.length);
        console.log(demo);
        console.groupEnd();
    }();

    (function () {
        var List = function () {
            return new ArrayLike();
        }, ArrayLike = function () {//这个array-like就是jQuery拆解版的实现
        };
        List.prototype = {
            constructor: List,
            length: 0,
            add: function (item) {
                Array.prototype.push.call(this, item);
            }
        };
        ArrayLike.prototype = List.prototype;
        console.group('第八种 - jQuery拆解版');
        var demo = List(); //这样就不用new了
        demo.add('List - add()');
        console.log('demo instanceof List ： %c' + (demo instanceof List), 'color:blue;'); //但是他们仍然不相等
        console.log('demo.constructor === List ：%c' + (demo.constructor === List), 'color:blue');
        console.log('[ ' + demo[0] + ' , ' + demo[1] + ' ]');
        console.log('length：' + demo.length);
        console.log(demo);
        console.groupEnd();
    })();
})();
