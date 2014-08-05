(function (window, undefined) {
    var Callbacks = window.Callbacks,
        Deferred = function (func) {
            var state = 'pending', //当前代码状态
            deferred = {}, //正统deferred
            promise = {}, //阉割版的deferred对象
            resolve = Callbacks({ once: true, auto: true }), //成功后执行的回调函数集合
            reject = Callbacks({ once: true, auto: true }), //失败后执行的回调函数集合
            progress = Callbacks({ auto: true }); //注意这里并没有清空过去的函数库，每次标识notify的时候都会执行的回调函数集合
            //开始逻辑代码———————promise的扩展

            //获取当前promise的状态
            promise.state = function () {
                return state;
            }
            //将外面传递进来的一个对象扩展promise的方法，主要用于一个对象扩展promise行为
            promise.promise = function (obj) {
                //把自己的方法扩展进去，注意这个方法等一下可以用来扩展deferred
                return obj != null ? window.$.extend(obj, promise) : promise;
            };

            //———————deferred和promise公共部分的扩展

            //为promise扩展done/fail/progress方法，并不扩展改变状态的resolve/reject/notify，同时扩展到deferred

            //因为Callbacks里面返回是this，因为这里的引用关系，依赖在不同对象上面的this都指向了该对象，例如deferred.done返回的是deferred，可以继续支持链式回调
            promise.promise(promise.done = resolve.add); //注意这里调用了promise的promise方法，相当于给deferred扩展了同名的done,fail,progress方法
            promise.promise(promise.fail = reject.add);
            promise.promise(promise.progress = progress.add);
            //扩展always方法
            promise.promise(promise.always = function () {
                deferred.done(arguments).fail(arguments);
                return this;
            });
            /*
            promise对象构建完成，它有如下方法：
            promise.state() - 获取deferred状态
            promise.promise() - 返回deferred的promise，也用于扩展参数传递进来的对象[主要是把这些最上面定义的回调函数和对象关联上]
            promise.done() - 追加一个(或一组)成功状态下执行的回调函数
            promise.fail() - 追加一个(或一组)失败状态下执行的回调函数
            promise.progress() - 追加一个(或一组)无状态下执行的回调函数
            promise.always() - 追加一个(或一组)无论成功失败都会执行的回调函数
            promise.then() - 尚未扩展，最后扩展
            还有一个pipe()没有看懂，也应该扩展进去
            */
            //———————promise已经完成，下面是deferred的扩展
            //可以看见这些函数的本质就是Callbacks的fireWith()，传递的参数最终都会到达各自委托的Callbacks对象中的函数里
            deferred.resolveWith = resolve.fireWith;
            deferred.rejectWith = reject.fireWith;
            deferred.progressWith = progress.fireWith;

            //给成功的回调函数系列追加一组方法，执行done()的时候会执行这组方法
            resolve.add(function () {
                //触发成功系列的回调函数
                deferred.resolveWith(this === deferred ? promise : this, arguments);
            }, reject.disable,  //把互斥状态的回调函数都给废掉
               function () {
                   //因为我自己编写的Callbacks里面的lock支持无参(获取这个Callbacks是否已经被锁)，所以这里需要再封一层
                   progress.lock(true);
               });
            //给失败的回调函数系列追加一组方法，执行fail()的时候会执行这组方法
            reject.add(function () {
                //触发失败系列的回调函数
                deferred.rejectWith(this === deferred ? promise : this, arguments);
            }, resolve.disable, //把互斥状态的回调函数都给废掉
               function () {
                   //因为我自己编写的Callbacks里面的lock支持无参(获取这个Callbacks是否已经被锁)，所以这里需要再封一层
                   progress.lock(true);
               });
            //给无状态的回调函数系列追加一组方法，执行notify()的时候会执行这组方法
            progress.add(function () {
                //触发无状态系列的回调函数
                deferred.progressWith(this === deferred ? promise : this, arguments);
            }, reject.disable, //把互斥状态的回调函数都给废掉
               function () {
                   //因为我自己编写的Callbacks里面的lock支持无参(获取这个Callbacks是否已经被锁)，所以这里需要再封一层
                   progress.lock(true);
               });

            //这是最顶层Deferred()传递进来的参数，意思就是只要传递进来那么就执行它，这个获取是方便then里面的操作
            if (func) {
                func.call(deferred, deferred);
            }
            //下面是重头戏，promise的then()方法


            return deferred;
        };
    window.$.Deferred = window.Deferred;
} (window));
