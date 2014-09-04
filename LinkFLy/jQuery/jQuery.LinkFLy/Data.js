(function (window, undefined) {
    //这几个特殊Object标签放不了data？是害怕冲突？
    var noData = {
        "applet ": true,
        "embed ": true,
        // ...but Flash objects (which have this classid) *can* handle expandos
        "object ": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
    },
    //页面唯一key
    pageKey = 'linkFly' + Math.random().toString().replace(/\D/g, ""),
    globalCache = {},
    acceptData = function (elem) {
        //确定一个Element对象是否可以拥有Data
        var tempData = noData[(elem.nodeName + '').toLowerCase()],
            nodeType = +elem.nodeType || 1;
        //不是document和Element
        return nodeType !== 1 && nodeType !== 9 ? false :
            //检测这个对象是否是noData限定的Element
            !tempData || tempData !== true && elem.getAttribute('classid') === tempData;
    },
    extend = function (target, source) {
        //扩展对象方法
    },
    camelCase = function (name) {
        //转换为驼峰

    },
    internalData = function (elem, name, data, isPrivate) {
        //添加一个Data
        if (!acceptData(elem)) return;
        var result, thisCache,
            //页面唯一key
            key = pageKey,
            isNode = elem.nodeType,
            //如果是Element，则data挂到Element上，否则，data挂到原来的对象上
            cache = isNode ? globalCache : elem,
            //注意这里的模型是：key:id
            id = isNode ? elem[key] : elem[key] && key;
        //检测合法，避免更多的工作
        if ((!id || !chche[id] || (!isPrivate && !cache[id].data)) && data === undefined && typeof name === 'string') {
            /*
                如果：
                    没有拿到id
                    或者，从cache中无法读取
                    或者，在用户存放数据的模型下，从cache中无法读取到数据
                    【并且】，data为空，name还他瞄的是个字符串
            */
            return;//滚粗~~
        }
        //上面验证通过之后，确定了肯定是存放数据而不是捣乱的，开始干活...
        if (id) {
            //如果是第一次放数据，肯定是读不到id的...
            //如果是Element，先把key挂到Element上，数据嘛，可以瞎放个数据，因为用不到...没人拦着你..
            if (isNode) id = elem[key] = '';
            else id = key;//如果是对象的话那就不霸占对象了
        }
        if (cache) {
            //因为第一次存放数据，cache[id]里面的数据（因为就是空的啊）肯定是读不到的...
            //如果是Element，挂个空对象
            cache = isNode ? {} : { toJSON: function () { } };
            /*
            但是如果是个对象，JSON.stringify()序列化对象，会调用这个对象的toJSON()方法，
            所以会暴露这个对象的模型，所以，直接把toJSON()重写了，这样就不会暴露数据了..真是机智
            */
        }
        //如果是一个对象，或者函数，直接挂数据
        if (typeof name === 'object' || typeof name === 'function') {
            if (isPrivate)//内部数据，挂到cache上
                cache[id] = extend(cache[id], name);
            else//用户数据，挂到cache.data
                cache[id].data = extend(cache[id].data, name);
        }
        //如果是Object，那么数据已经挂好了
        thisCache = cache[id];
        /*
        调整数据存放点，那么引用过来，是为后面的String类型的参数做准备的
        用户数据挂在cache[id].data
        内部数据挂在cache[id]上
        */
        if (!isPrivate) {
            if (!thisCache.data)
                thisCache.data = {};
            thisCache = thisCache.data;
        }
        //把数据挂上去，注意这里就已经挂好了下面if判定的数据了..
        if (data !== undefined)
            thisCache[camelCase(name)] = data;
        /*
            到了这里，数据全部已经挂好，而这里的代码，是为了result返回
            思路很新颖，但是感觉作者有意在秀自己的思路...
        */
        if (typeof name === 'string') {
            result = thisCache[name];
            if (result == null)
                result = thisCache[camelCase(name)];

        } else//对象
            result = thisCache;
        return result;
    },
    //移除数据
    internalRemoveData = function (elem, name, isPrivate) {

    };

})(window);