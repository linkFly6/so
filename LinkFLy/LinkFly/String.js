(function (window, undefined) {
    var linkFly = {};
    linkFly.contains = function (target, str) {
        /// <summary>
        ///     1: 检测一个字符串是否包含另外一个字符串
        ///     &#10;    1.1 - contains(obj)
        /// </summary>
        /// <param name="target" type="String">
        ///     要检测的字符串
        /// </param>
        /// <param name="str" type="String">
        ///     包含的字符串
        /// </param>
        /// <returns type="Boolean" />
        return target && str ? target.indexOf(str) != -1 : '';
    };
    linkFly.byteLength = function (target, fix) {
        /// <summary>
        ///     1: 检测一个字符串byte长度
        ///     &#10;    1.1 - byteLength(obj)
        /// </summary>
        /// <param name="target" type="String">
        ///     要检测的字符串
        /// </param>
        /// <param name="fix" type="String">
        ///     汉字字符表示的字符长度，默认为2
        /// </param>
        /// <returns type="Int" />
        fix = fix && parseInt(fix) + 1 || 3;
        //length为3的数组只会拼接出"--"
        var str = new Array(fix).join('-');
        return target ? target.replace(/[^\x00-\xff]/g, str).length : '';
    };
    linkFly.truncate = function (target, length, truncation, isByte) {
        /// <summary>
        ///     1: 截断一个字符串，提供字数截断和字节截断
        ///     &#10;    1.1 - truncate(target, length, truncation, isByte)
        ///     &#10;    1.1 - truncate(target, length, isByte)
        /// </summary>
        /// <param name="target" type="String">
        ///     要截断的字符串
        /// </param>
        /// <param name="length" type="String">
        ///     截断的长度
        /// </param>
        /// <param name="truncation" type="String">
        ///     截断后缀
        /// </param>
        /// <param name="isByte" type="String">
        ///     是否按照字节模式截断
        /// </param>
        /// <returns type="String" />
        if (typeof truncation === 'boolean') {
            isByte = truncation;
            truncation = undefined;
        }
        length = length || 30;
        //过滤null和undefined
        truncation = truncation == undefined ? '...' : truncation;
        return isByte ?
        +function () {//byte cut
            var temp = target.replace(/[^\x00-\xff]/g, '\r\n').split('');
            length = temp[length - 1] == '\r' ? length - 2 : length - 1; //convert to index
            return target.substr(0,
            //临时数组再拼接回来，并得到长度
            //这里的可以优化，把Array的slice方法通过闭包缓存起来
            Array.prototype.slice.call(temp, 0, length).join('').replace(/\r\n/g, '*').length + 1
            );
        } () :
        ~function () {//chinese cut
            return target.length > 30 ? Array.prototype.slice.call(target, 0, length - truncation.length) + truncation : String(target);
        } ();
    }
    linkFly.camelize = function (target) {
        /// <summary>
        ///     1: 将一个字符串转换为驼峰写法(newName)
        ///     &#10;    1.1 - camelize(target)
        /// </summary>
        /// <param name="target" type="String">
        ///     要转换的字符串
        /// </param>
        /// <returns type="String" />
        return target ?
            target.indexOf('-') < 0 && target.indexOf('_') < 0 ?
        //这个正则不仅匹配"-"，也匹配"_"
            target : target.replace(/[-_][^-_]/g, function (match) {
                return match.charAt(1).toUpperCase();
            })
        : '';
    };

    linkFly.trim = function () {
        /// <summary>
        ///     1: 修剪两侧的字符串
        ///     &#10;    1.1 - trim(str)
        /// </summary>
        /// <param name="str" type="String">
        ///     要修剪的字符串
        /// </param>
        /// <returns type="String" />    

        //本来可以采用/^\s+|\s+$/这样的带有“或”语法的正则一次替换，但是这样会失去浏览器优化
        //所以采用两次替换，但速度仍然惊人（相比不使用正则原生方法仍然略慢）
        return /\S/.test('\xA0') === true ? function (str) {
            return str == null ? '' : str.toString().replace(/^\s+/, '').replace(/\s+$/, '');
        } : function (str) { //ie6下\s并不含空白符\xa0，修复这个bug，为了性能采用预编译机制
            return str == null ? '' : str.toString().replace(/^[\s\xA0]+/, '').replace(/[\s\xA0]+$/, '');
        };

    } ();

    linkFly.format = function (str, object) {
        var array = Array.prototype.slice.call(arguments, 1);
        //可以被\符转义
        return str.replace(/\\?\${([^{}])\}}/gm, function (match, key) {
            //匹配转义符"\"
            //如果丧心病狂一点可以在这里匹配二次转义
            if (match.charAt(0) == '\\')
                return match.slice(1);
            var index = Number(key);
            if (index >= 0)
                return array[index];
            return object[key] ? object[key] : match;
        });
    };

} (window));