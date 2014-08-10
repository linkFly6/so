(function () {
    !function () {
        //第一种Array-Like
        var List = function () { };
        List.prototype = new Array();
        List.prototype.constructor = List;
        List.prototype.add = function (item) {
            this.push(item);
        };
        //测试
        console.group('第一种Array-Like测试');
        var demo = new List();
        demo.push('Array - push()');
        demo.add('List - add()');
        console.log(demo instanceof List);
        console.log('[ ' + demo[0] + ' , ' + demo[1] + ' ]');
        console.groupEnd();
    } ();

    //    !function () {
    //        //第二种Array-Like
    //        var List = function () {
    //            //如果外面直接return [];
    //            //想想会发生什么。
    //            var data = [];
    //            data.add = function (item) {
    //                this.push(item);
    //            };
    //            data.__proto__ = List;
    //            List.constructor = List;
    //            data.constructor = List;
    //            data.prototype = List;
    //            data.prototype.constructor = List;
    //            return data;
    //        };
    //        console.group('第二种Array-Like测试');
    //        var demo = new List();
    //        demo.push('Array - push()');
    //        demo.add('List - add()');
    //        console.log(demo instanceof List);
    //        console.log('[ ' + demo[0] + ' , ' + demo[1] + ' ]');
    //        console.groupEnd();
    //    } ();

    !function () {
        //jQuery Array-Like实现
        var List = function () {
            return new List.fn.init();
        };
        List.fn = List.prototype = {
            constructor: List,
            length: 0,
            add: function (item) {
                this[0] = item;
            }
        };
        List.fn.init = function () {
            return [];
        };
        List.fn.init.prototype = List.fn;
        console.group('jQuery Array-Like测试');
        var demo = new List();
        //        demo.push('Array - push()');
        //        demo.add('List - add()');
        console.log(demo instanceof List);
        console.log(demo[0]);
        console.groupEnd();
    } ();
})();
