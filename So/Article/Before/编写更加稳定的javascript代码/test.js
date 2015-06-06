//代码太多沉重
(function (window, namespace) {
    var $ = window.jQuery;
    window[namespace] = function (targetId, textId) {
        //一个尝试复用的获取位置的"组件"
        var $target = $('#' + targetId),//按钮
            $text = $('#' + textId);//显示文本
        $target.on('click', function () {
            $text.html('获取中');
            var data = '北京市';//balabala很多逻辑，伪代码，获取得到位置中
            if (data) {
                $text.html(data);
            } else
                $text.html('获取失败');
        });
    }
})(window, 'linkFly');
//代码太多沉重




//函数过分依赖外部环境
(function (window, namespace) {
    var $ = window.jQuery,
        $target,
        $text,
        states = ['获取中', '获取失败'];
    function done(address) {//获取位置成功
        $text.html(address);
    }
    function fail() {
        $text.html(states[1]);
    }
    function checkData(data) {
        //检查位置信息是否正确
        return !!data;
    }
    function loadPosition() {
        var data = '北京市';//获取位置中
        if (checkData(data)) {
            done(data);
        } else
            fail();
    }
    var init = function () {
        $target.on('click', function () {
            $text.html(states[0]);
            loadPosition();
        });
    };
    window[namespace] = function (targetId, textId) {
        $target = $('#' + targetId);
        $text = $('#' + textId);
        initData();
        setData();
    }
})(window, 'linkFly');
//函数过分依赖外部环境


//语义化和复用
(function (window, namespace) {
    var $ = window.jQuery;
    function checkData(data) {
        return !!data;
    }
    function loadPosition(done, fail) {
        var data = '北京市';//获取位置中
        if (checkData(data)) {
            done(data);
        } else
            fail();
    }
    window[namespace] = function (targetId, textId) {
        var $target = $('#' + targetId),
            $text = $('#' + textId),
            changeEnum = { LOADING: '获取中', FAIL: '获取失败' },
            changeStateText = function (text) {
                $text.html(text);
            };
        $target.on('click', function () {
            changeStateText(changeEnum.LOADING);
            loadPosition(function (address) {
                changeStateText(address);
            }, function () {
                changeStateText(changeEnum.FAIL);
            });
        });
    }
})(window, 'linkFly');
//语义化和复用


//组件应该关注逻辑分离，行为只是封装
(function (window, namespace) {
    var Gps = {
        load: function (fone, fail) {
            var data = '北京市';//获取位置伪代码
            this.check(data) ?
                done(data, Gps.state.OK) :
                fail(Gps.state.FAIL);
        },
        check: function (data) {
            return !!data;
        },
        state: { OK: 1, FAIL: 0 }
    };
    window[namespace] = Gps;
})(window, 'Gps');


(function () {
    //第一种，曝露了_name属性
    var Demo = function () {
        if (!(this instanceof Demo))
            return new Demo();
        this._name = 'linkFly';
    };
    Demo.prototype.getName = function () {
        return this._name;
    }

    //第二种，多一层闭包意味内存消耗更大，但是屏蔽了_name属性
    var Demo = function () {
        var name = 'linkFly';
        return {
            getName: function () {
                return name;
            }
        }
    }
});


(function () {
    var key = 'linkFly',
        cache = { 'linkFly': 'http://www.cnblogs.com/silin6/' },
        value;
    //&&到底
    key && cache && cache[key] && (value = cache[key]);
    //来个if
    if (key && cache && cache[key])
        value = cache[key];
})()


//组织代码，巧用变量提升
(function () {
    var names = [];
    return function (name) {
        addName(name);
    }
    function addName(name) {
        if (!~names.indexOf(name))//如果存在则不添加
            names.push(name);
        console.log(names);// ["linkFly"]
    }
}())('linkFly');

//巧用call调整this指向