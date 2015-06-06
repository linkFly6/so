var SogouGps = function (done, fail, time) {
    /// <summary>
    ///     1: 请求sogou gps信息对象，返回一系列便捷API的对象
    ///     &#10;    1.1 - sogouGps() - 建立gps对象
    ///     &#10;    1.2 - sogouGps(done, fail, time) - 建立gps对象，同时发送获取gps请求 
    /// </summary>
    /// <param name="done" type="Function">
    ///     委托一个获取地理位置成功的函数，接收两个参数：[获取到的地理位置信息，经纬度信息对象]，当从cookie中可以读取到地理位置信息的时候，经纬度信息为null（请自行获取），this指向sogouGps对象实例
    /// </param>
    /// <param name="fail" type="Function">
    ///     委托一个获取地理位置失败的函数，接收一个对象参数：{code:错误编码[1、2、3为浏览器错误，-1表示浏览器不支持定位，100表示超时，101表示定位信息不正确],message:错误描述}
    /// </param>
    /// <param name="time" type="Int">
    ///     设置一个超时时间（ms），默认为10000ms
    /// </param>
    /// <returns type="SogouGps" />
    var cookieId = 'G_LOC_MI',
        isLoad = false,//是否正在加载
        handleTime,//超时调用函数
        isLock = false,//是否锁定
        toString = Object.prototype.toString,
        jsonp = function (url, callback) {
            var cb = "ajaj_" + (new Date().getTime());
            window[cb] = callback;
            url = url.replace(/=\?/, "=" + cb);
            var h = document.getElementsByTagName("head")[0];
            var s = document.createElement("script");
            s.type = "text/javascript";
            s.src = url;
            h.appendChild(s);
        },
        isFunction = function (obj) {
            return toString.call(obj) === '[object Function]';
        },
        cookie = function (cookieId, name, value) {
            //获取/设置sogou cookie
            if (name) {
                sogou.Cookie.setCookie(cookieId, encodeURIComponent(name), value);
            } else {
                value = sogou.Cookie.getCookie(cookieId);
                return value ? decodeURIComponent(value) : null;
            }
            return null;
        },
        cookie2data = function (cookieData) {
            //将cookie值转换成json
            if (cookieData) {
                try {
                    return JSON.parse(cookieData);
                } catch (e) { }
            }
        },
        checkdata = function (data) {
            //检测一个cookie转换的gps对象是否有效
            if (data && (data.addr || data.caption)) {
                return true;
            }
        },
        fillCookie = function (gdata) {
            var H_LOC_MI = ['{"v":"1.0","city":"', gdata.city,
                    '","province":"', (gdata.province ? gdata.province : ""),
                    '","GLOC":"', gdata.gloc,
                    '","county":"', gdata.county,
                    '","addr":"' + gdata.addr + '"}'].join('');
            cookie(cookieId, H_LOC_MI, 1);
        },
        getaddr = function (data) {
            var province = data.province,
                city = data.city,
                caption = data.caption,
                county = data.county,
                addr = data.addr,
                ret = [];

            if (caption)
                ret.unshift(caption);
            if (addr)
                ret.unshift(addr);
            if (county)
                ret.unshift(county);
            if (city && ret.length)
                ret.unshift(city);

            if (province && ret.length <= 6) {
                ret.unshift(province);
            }
            return { data: data, location: ret.join('') };
        },
        get = function (resolve, reject, time) {
            if (window.sogou.api && window.sogou.api.getLocation) {
                sogou.api.getLocation(function (position) {
                    var y = position.latitude, x = position.longitude;
                    var url = "http://m.sogou.com/web/maplocate.jsp?points=" + x + "," + y + "&cb=?";
                    jsonp(url, function (data) {
                        resolve(data, { latitude: y, longitude: x });
                    })
                }, function (error) {
                    reject(error);
                }, { timeout: time != null ? time : 10000 });
            } else if (navigator.geolocation && navigator.geolocation.getCurrentPosition) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    console.log(position);
                    var y = position.coords.latitude, x = position.coords.longitude;
                    var url = "http://m.sogou.com/web/maplocate.jsp?points=" + x + "," + y + "&cb=?";
                    jsonp(url, function (data) {
                        resolve(data, { latitude: y, longitude: x });
                    })
                }, function (error) {
                    reject(error);
                }, { timeout: time != null ? time : 10000 });
            } else {
                reject({ code: -1, message: '浏览器不支持定位' });
            }
        },
        self = {
            constructor: SogouGps,
            send: function (done, fail, time) {
                //发送请求，获取位置
                var isOver = false;//标识这一次的请求是否结束
                if (isLock || isLoad || !isFunction(done)) return self;
                isLoad = true;
                get(function (data, position) {
                    if (isOver) return;
                    clearTimeout(handleTime);
                    isLoad = false;
                    if (data && data.status == 'ok') {
                        var longitude = position.longitude,
                            latitude = position.latitude, qqpos;
                        if (longitude >= 0 && latitude >= 0) {
                            qqpos = longitude + "|" + latitude;
                            sogou.Cookie.setCookie("qqpos", qqpos, 90);
                        }
                        fillCookie(data);
                        done.call(self, getaddr(data), { lat: latitude, lon: longitude });
                    } else
                        isFunction(fail) && fail.call(self, { code: 101, message: '位置信息不正确' });
                }, function (error) {
                    if (!isLoad) return;
                    isLoad = false;
                    clearTimeout(handleTime);
                    isFunction(fail) && fail.call(self, error);
                });
                isLoad = true;
                handleTime = setTimeout(function () {
                    isOver = true;
                    isFunction(fail) && fail.call(self, { code: 100, message: '请求位置信息超时' });
                    isLoad = false;
                }, time || 10000);
                return self;
            },
            lock: function () {
                isLock = true;
                return self;
            },
            get: function () {
                //检测位置信息是否存在于cookie，有则返回，否则返回null
                var data = cookie2data(cookie(cookieId)), location;
                return checkdata(data) ? getaddr(data) : null;
            },
            cookie2data: cookie2data,
            cookie: cookie
        };
    if (isFunction(done)) {
        var data = self.get(), pos;
        if (data) {
            pos = sogou.Cookie.getCookie('qqpos').split('|');
            pos = { lat: pos[1], lon: pos[0] };
            done.call(self, data, pos)
        } else
            self.send(done, fail, time);
    }
    return self;
}