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
    globalId = 0,
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
    isArray = function (name) { },
    map = function (elem, fn) {
    },
    isEmptyObject = function (obj) {

    },
    isEmptyDataObject = function () { },
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
            //如果是Element，把key挂到Element上，这里的id是全局唯一id
            if (isNode) id = elem[key] = globalId++;
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
        if (!acceptData(elem)) return;
        var thisCache,
            i,
            isNode = elem.nodeType,
            cache = isNode ? globalCache : elem,
            id = isNode ? elem[pageKey] : pageKey;
        if (cache[id]) return;//找不到data，那还搞个毛线啊
        if (name) {
            thisCache = isPrivate ? cache[id] : cache[id].data;
            if (thisCache) {
                if (!isArray(name))//（类）数组判定，支持批量删除
                {
                    //检测name是在cache中
                    if (name in thisCache)
                        name = [name];
                    else {
                        //检测失败，转换为驼峰再次检测
                        name = camelCase(name);
                        if (name in thisCache)
                            name = [name];
                        else//再次检测失败，那么按照空格来切割array，既严谨也让API更加的强大
                            name.split(' ');
                    }
                } else {
                    //把为array创建一份经过驼峰转换的版本，和当前的array连接
                    //这样可以保证经过驼峰转换的data也可以被删除
                    name = Array.prototype.concat.call(name, map(name, camelCase));
                }
                i = name.length;
                //删除data
                while (i--)
                    delete thisCache[name[i]];
                /*
                    注意这里的判定：
                        这里的判定检测了thisCache是否为空，如果不为空，则表示任务已经完成
                        如果为空，则需要把thiaCache彻底重置？
                */
                if (isPrivate ? !isEmptyDataObject(thisCache) : !isEmptyObject(thisCache))
                    return;
            }
        }
        /*
            如果到了这里，证明data已经删除干净了，那么顺便把cache.data也给清理掉
        */
        if (!isPrivate) {
            delete cache[id].data;
            if (!isEmptyDataObject(cache[id])) return;
        }
        //TODO

    };

})(window);