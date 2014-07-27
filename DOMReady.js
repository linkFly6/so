/*!
* by - linkfly
* cnblogs - http://www.cnblogs.com/silin6/ 
*/
(function (window, undefined) {
    /*
    *                                   checkReady
    * event model：ready ->> bindReady ->> 
    *                                   ie(iframe):doScrollCheck ->> checkReady
    */
    var readyList = [],                     //DOM Ready执行的数组
        document = window.document,
        DOMContentLoaded,                   //DOMReady事件
        isReady = false,                    //DOM是否准备完毕
        triggerReady = function () {        //触发ready事件
            while (readyList.length) {
                readyList[0].call(window); //指定上下文
                readyList.shift();
            }
        };
    //ready执行方法，检测需要的环境是否已经准备好，它是DOM Ready最后一道关卡
    var checkReady = function () {
        if (!document.body) { return setTimeout(checkReady, 1); }
        isReady = true; //标识完成
        triggerReady();
    },
    //本来还想使用一个wait数组表示当前正在等待执行的数据，但是因为下面用的addEventListener和attachEvent，所以直接让js Event维护即可
     bindReady = function () {         //绑定ready
         //body必须存在
         //如果DOM Ready，则直接触发，Firefox3.6之前并没有readyState，考虑市场因素抛弃这部分兼容
         if (document.readyState === 'complete' || isReady) { return setTimeout(triggerReady, 1); }
         if (document.addEventListener) {//w3c
             document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
             //如果没有赶上DOM Ready，则监听load
             window.addEventListener("load", checkReady, false);
         } else if (document.attachEvent) {//ie
             document.attachEvent("onreadystatechange", DOMContentLoaded);
             window.attachEvent("onload", checkReady);
             //ie下多iframe
             var toplevel = false;
             try {
                 toplevel = window.frameElement == null;
             } catch (e) { }
             if (document.documentElement.doScroll && toplevel) {
                 doScrollCheck();
             }
         }
     },
    doScrollCheck = function () {                  //ie678检测iframe的DOMReady
        try {
            //IE下页面DOM没有加载完成，调用doScroll会报错
            document.documentElement.doScroll("left");
            checkReady();
        } catch (e) {
            setTimeout(doScrollCheck, 1);
        }
    },
    ready = function (fn) {                 //DOM Ready
        readyList.push(fn);
        bindReady();
    };
    ~function () {
        if (document.addEventListener) {
            DOMContentLoaded = function () {
                document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
                checkReady();
            };
        } else if (document.attachEvent) {
            DOMContentLoaded = function () {
                if (document.readyState === "complete") {
                    document.detachEvent("onreadystatechange", DOMContentLoaded);
                    checkReady();
                }
            };
        }
    } ();
    window.$ = window.ready = ready;
})(window);