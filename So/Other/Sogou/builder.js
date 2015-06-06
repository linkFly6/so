(function (window, undefined) {
    var serializationQoQuery = function (qoQuery) {
        /// <summary>
        ///     1:  - getType(qoQuery) - 将qoQuery转换为对象
        /// </summary>
        /// <param name="obj" type="qoQuery">
        ///     qoQuery
        /// </param>
        /// <returns type="String" />
        if (!qoQuery) return {};
        var res = {}, arr = qoQuery.indexOf('||') === -1 ? [qoQuery] : qoQuery.split('||'), temp, filter;
        arr.forEach(function (item) {
            temp = item.split('::');
            res[temp[0].toLowerCase()] = temp[1];
        });
        return res;
    },
    //构建一个全局id，每次读取都将自我累加
    Guid = Object.create(null, {
        'id': {
            enumerable: true,
            get: function () {
                var i = 1;
                return function () {
                    return i++;
                }
            }()
        }
    }),
    //将qo对象序列化成qo字符串
    getQoStr = function (qoInfo, noEncode) {
        /// <summary>
        ///     getQoStr(qoInfo) - 打入一个qoInfo，返回该qoInfo生成的字符串
        ///     &#10;    1.1 - getQoStr(qoInfo) - 让qoInfo生成字符串 
        ///     &#10;    1.2 - getQoStr(qoInfo,noEncode) - noEcode可以指定是否进行2次编码
        /// </summary>
        /// <param name="qoInfo" type="Object">
        ///     qoInfo
        /// </param>
        /// <param name="noEncode" type="Boolean">
        ///     是否进行2次编码，默认为true（进行2次编码），指定为false则阻止2次转码
        /// </param>
        /// <returns type="String" />
        var qoStr = [''];
        for (var key in qoInfo) {
            if (qoInfo[key] != null)
                qoStr.push('&', key, '=', encodeURIComponent(qoInfo[key]));
        }
        qoStr = qoStr.join('').substring(1);
        return noEncode === false ?
            qoStr : encodeURIComponent(qoStr);
    },
    //序列化vrSelect
    serializtionVrselect = function (selectStr) {
        if (!selectStr) return Object.create(null);
        selectStr = JSON.parse(selectStr);
        var rs = Object.create(null);
        selectStr.forEach(function (item) {
            if (rs[item.name]) return;
            var dis = Object.create(null);
            dis[item.name] = { value: item.data };
            Object.definedPropertie(rs, dis);
        });
    };


    //————————————————————url拼接
    var pid = function () {
        var r = window.location.search.substr(1).match(/(^|&)pid=([^&]*)(&|$)/i);
        return r ? "&dp=1&pid=" + r[2] : '';
    }(),
    getUrl = function (url, linkId) {
        return [tcurl.replace(/&amp;/g, '&'), "wml=1&clk=", rank, "&url=", encodeURIComponent(url), '&vrid=', classId, '&linkid=', linkId || '2', pid].join('');
    };


    //———————————————————————云图url
    var getImgUrl = function (url, isZip) {
        //100520054为压缩版
        return ['http://img02.store.sogou.com/net/a/', isZip === false ? '100520053' : '100520054', '/link?appid=', isZip === false ? '100520053' : '100520054', '&url=', encodeURIComponent(url)].join('');
    }

    var leftEm = /\ue40a/g, //标红，标红的左侧
        rightEm = /\ue40b/g, //标红的右侧
        offsetImg = function (img, width, height, callback) {
            if (img.getAttribute('data-width')) {
                //可以直接引用style 优化
                img.style.width = img.getAttribute('data-width');
                img.style.height = img.getAttribute('data-height');
                img.style.marginLeft = '';
                img.style.marginTop = '';
            }
            if (parseInt(img.style.height) == 0) {
                setTimeout(function () {
                    offsetImg(img, width, height, callback);
                }, 50);
                return;
            }
            //save old data
            img.setAttribute('data-width', img.width);
            img.setAttribute('data-height', img.height);
            var sw = parseInt(img.style.width),
                sh = parseInt(img.style.height);
            var ml, mt, o = {};       //margin-left, margin-top
            if (height * sw < width * sh && (height > sh || width > sw)) {	//too wide
                width = width * sh / height;
                ml = (width - sw) / 2;
                mt = 0;
                if (height != sh)
                    o.height = sh;
            } else {	//too high
                height = height * sw / width;
                mt = height - sh;
                if (mt > height * 0.16)
                    mt = height * 0.08;
                else
                    mt /= 2;
                ml = 0;
                if (width != sw)
                    o.width = sw;
            }
            img.style.marginLeft = -parseInt(ml) + 'px';
            img.style.marginTop = -parseInt(mt) + 'px';
            if (o.height) {
                img.style.height = o.height + 'px'; //+'px';
                img.style.width = 'auto';
            } else if (o.width) {
                img.style.width = o.width + 'px'; //+'px';
                img.style.height = 'auto';
            }
            if (typeof callback === 'function')
                callback(img);
        },
        isKeywords = function (keywords) {
            //给定一组关键字，判定当前查询是否命中这个关键字，命中则为当前关键字，并返回一个检测关键字是否命中当前关键字的函数
            var key;//当前应该命中的关键字
            return keywords.every(function (str) {
                //window.oldQuery===故宫旅游|故宫周边游|故宫跟团游
                return !(!!~window.oldQuery.indexOf(str) && (key = str));
            }) ?
                function () {
                    return false;
                } : function (value) {//检测一个值是否命中关键词
                    return !!~value.indexOf(key);
                }
        }(['自由', '跟团', '周边']),
        writeJSONP = function (url) {
            var node = document.createElement('script');
            node.type = "text/javascript";
            node.charset = "utf-8";
            node.src = url;
            document.getElementsByTagName('head')[0].appendChild(node);

        },
        //格式化字符串方法，使用：${0},${1}、${name},${value}
        format = function (str, object) {
            /// <summary>
            ///     1: format(str,object) - 格式化一组字符串，参阅C# string.format()
            ///     &#10;    1.1 - format(str,object) - 通过对象格式化
            ///     &#10;    1.2 - format(str,Array) - 通过数组格式化
            /// </summary>
            /// <param name="str" type="String">
            ///     格式化模板(字符串模板)
            /// </param>
            /// <param name="object" type="Object">
            ///     Object:使用对象的key格式化字符串，模板中使用${name}占位：${data},${value}
            ///     Array:使用数组格式化，模板中使用${Index}占位：${0},${1}
            /// </param>
            /// <returns type="String" />
            var array = Array.prototype.slice.call(arguments, 1);
            //可以被\符转义
            return str.replace(/\\?\${([^{}]+)\}/gm, function (match, key) {
                //匹配转义符"\"
                if (match.charAt(0) == '\\')
                    return match.slice(1);
                var index = Number(key);
                if (index >= 0)
                    return array[index];
                return object[key] !== undefined ? object[key] : match;
            });
        };



})(window);