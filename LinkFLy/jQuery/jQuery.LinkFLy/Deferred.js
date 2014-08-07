(function (window, undefined) {
    /*
    收获：
    -  本质上，用回调函数实现，详见#31
    -  this的使用非常巧妙，使用this成功把Callbacks的方法嫁接到Deferred中，详见#31
    -  Callbacks模型的把控
    -  then：最终是返回一个Deferred
    -  
    */
    var extend = function () { 
        
    };

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
            deferred.notifyWith = progress.fireWith;


            //给成功的回调函数系列追加一组方法，执行done()的时候会执行这组方法
            if (state) {//如果存在状态，则追加一组函数
                /*
                deferred对象当存在状态（resolve、reject、notify）之后，再追加的done、fail、progress会自动执行
                因为Callbacks配置的是once&auto（memory）模型！想象这个模型，是不是自动执行
                */
                resolve.add(function () {
                    //触发成功系列的回调函数
                    deferred.resolveWith(this === deferred ? promise : this, arguments);
                }, reject.disable,  //把互斥状态的回调函数都给废掉
                   function () {
                       progress.lock(true);
                   });
                //给失败的回调函数系列追加一组方法，执行fail()的时候会执行这组方法
                reject.add(function () {
                    //触发失败系列的回调函数
                    deferred.rejectWith(this === deferred ? promise : this, arguments);
                }, resolve.disable, function () {
                    progress.lock(true);
                });
                //给无状态的回调函数系列追加一组方法，执行notify()的时候会执行这组方法
                progress.add(function () {
                    deferred.notifyWith(this === deferred ? promise : this, arguments);
                }, reject.disable, function () {
                    progress.lock(true);
                });

            }
            //这是最顶层Deferred()传递进来的参数，意思就是只要传递进来那么就执行它，这个获取是方便then里面的操作
            if (func) {
                func.call(deferred, deferred);
            }
            //下面是重头戏，promise的then()方法
            promise.then = function () {
                //then方法的本质就是把函数压到对应的Callbacks里面去
                var fns = arguments;
                //注意上面的这个匿名函数就是上面的func
                //参数是闭包里的deferred对象，所以data就是deferred
                return Deferred(function (data) {
                    //————————————————————————
                    //对应的方法都是Callbacks的add
                    deferred.done(function () {//这个匿名函数是Callbacks.fireWith()的时候执行的
                        //我们假设参数都是正确的函数，这里不对fn进行检测了
                        //这个方法在状态改变的时候就应该执行
                        var fn = fns[0];
                        //我们执行它
                        var returnData = fn && fn.apply(this, arguments);
                        //如果有promise(promise/A)的行为
                        if (returnData && returnData.promise) {
                            //这段代码是jQuery源码，但是意义呢？
                            //它是把这组函数已经扩展到promise，但是这样做的意义呢？
                            //是针对promise的扩展！
                            //但是这个扩展的意义呢？
                            returnData.promise()
                            //想想resolve()方法，不就是Callbacks.fireWith()么？
                            //这样不就间接性的把一组函数给压到新的deferred对象中了么？
                              .done(data.resolve)
                              .fail(data.reject)
                              .progress(newDefer.notify);
                        } else {
                            //data一定是deferred对象
                            //如果fn()方法返回的对象没有promise(promise/A)行为[在这里，绝大多数promise行为源于Deferred]
                            //那么我们判定是否是then返回的promise
                            //判断这个触发的行为是否是promise的触发行为?但是promise有触发接口？？
                            //什么情况下有this===promise？？
                            //如果外面的fn返回有结果，那么把这个结果传递给下一层
                            //这里指明了this，Callbacks里最终返回是this，这里的this指向一个promise对象
                            //这里的promise是在最顶层，判断是否到达最顶层？是防止顶层开放了deferred么？
                            //如果是防止顶层，那么直接data.promise()不行么？
                            data.resolveWith(this === promise ? data.promise() : this, fn ? [returnData] : arguments);
                        }
                    });
                    //和上面类似的追加
                    deferred.fail(function () {
                        var fn = fns[1];
                        var returnData = fn && fn.apply(this, arguments);
                        //这个data的数据从哪儿来的？
                        data.rejectWith(this === promise ? data.promise() : this, fn ? [returnData] : arguments);
                    });
                    deferred.fail(function () {
                        var fn = fns[1];
                        var returnData = fn && fn.apply(this, arguments);
                        data.notifyWith(this === promise ? data.promise() : this, fn ? [returnData] : arguments);
                    });
                    fns = null;
                    //注意这里和then的关系，因为返回的promise，用这个promise done一个函数进来
                    //那么then里面的那个data，就会得到这个函数，所以上面有代码：data.resolveWith(this === promise ? data.promise() : this, fn ? [returnData] : arguments);
                    //就相当于把执行掉了，这里对于闭包的把控非常精准
                }).promise(); //返回被切掉小jj的promise

            };

            //【尚未分析到progress】
            return deferred;
        };
    window.$.Deferred = window.Deferred;
} (window));
