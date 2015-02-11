(function (num) {//从外面接收一个参数
    var writeName = function (callback) {
        if (num === 1)
            callback();
    }
    writeName(function () {//callback
        console.log("i'm linkFly");
    });
})(1);


(function () {
    var name;
    setTimeout(function () {
        name = 'linkFly';
    }, 1000);//1s后执行
    console.log(name);//先输出，并且输出undefined

    $.ajax({
        url: 'http://www.cnblogs.com/silin6/map',
        success: function (key) {
            $.ajax({
                url: 'http://www.cnblogs.com/silin6/source/' + key,
                success: function (data) {
                    console.log("i'm linkFly");//后输出
                }
            });
        }
    });
    console.log('ok');//ok会在ajax之前执行


    var name,
        ajax = function (data) {
            return new Promise(function (resolve) {
                setTimeout(function () {//我们使用setTimeout模拟ajax
                    resolve(data);
                }, 1000);//1s后执行
            });
        };

    ajax('linkFly').then(function (name) {
        return ajax("i'm " + name);//模拟第二次ajax
    }).then(function (value) {
        //2s后，输出i'm linkFly
        console.log(value);
    });

    var p = new Promise(function (resolve, reject) {
        console.log(arguments);
        setTimeout(function () {
            resolve();
        }, 1000);
    });
    p
        .then(function () {
            return new Promise(function (resolve) {
                setTimeout(function () {
                    resolve('resolve');
                }, 1000);
            });
            console.log('resolve');
        }, function () {
            console.log('reject');
        })

        .then(function (state) {
            console.log('state', state);
        }, function (data) {
            console.log(data);//undefined
        });


    var ajax = function (url) {
        //我们改写ajax，让它以Promise的方式工作
        return new Promise(function (resolve) {
            $.ajax({
                url: url,
                success: function (data) {
                    resolve(data);
                }
            });
        });
    };

    ajax('http://www.cnblogs.com/silin6/map')
        .then(function (key) {
            //我们得到key，发起第二条请求
            return ajax('http://www.cnblogs.com/silin6/source/' + key);
        })
        .then(function (data) {
            console.log(data);//这时候我们会接收到第二次ajax返回的数据
        });



    var name,
        p = new Promise(function (resolve) {
            setTimeout(function () {//异步回调
                resolve();
            }, 1000);//1s后执行
        });
    p.then(function () {
        name = 'linkFly';
        console.log(name);
    }).then(function () {
        name = 'cnBlog';
        console.log(name);
    });
})();

