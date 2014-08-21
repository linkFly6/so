(function (window, undefined) {
    var push = Array.prototype.push,
        splice = Array.prototype.splice,
        indexOf = Array.prototype.indexOf,
        slice = Array.prototype.slice,
        document = window.document,
        truncate = function (target, length, truncation, isByte) {
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
            ///     是否按照字节模式截断（默认false）
            /// </param>
            /// <returns type="String" />
            if (typeof truncation === 'boolean') {
                isByte = truncation;
                truncation = undefined;
            }
            length = length || 30;
            //过滤null和undefined
            truncation = truncation == undefined ? '...' : truncation;
            if (isByte) {
                var temp = target.replace(/[^\x00-\xff]/g, '\r\n').split('');
                length = temp[length - 1] == '\r' ? length - 2 : length - 1; //convert to index
                //临时数组再拼接回来，并得到长度
                //这里的可以优化，把Array的slice方法通过闭包缓存起来
                temp = Array.prototype.slice.call(temp, 0, length).join('').replace(/\r\n/g, '*').length + 1;
                return temp >= target.length ? target : target.substr(0, temp) + truncation;
            }
            return target.length > 30 ? Array.prototype.slice.call(target, 0, length - truncation.length) + truncation : String(target);
        };
    var X = function () {

        var doc = document,
            self = {
                constructor: X,
                load: function (xml, filter) {
                    /// <summary>
                    ///     1: 基于xpath或标签查找
                    ///     &#10;    1.1 - load(xml[,filter])：基于xml字符串生成
                    ///     &#10;    1.1 - load(document[,filter])：基于document对象生成
                    /// </summary>
                    /// <param name="xml" type="String">
                    ///     xpath或tag标签
                    /// </param>
                    /// <param name="filter" type="boolean">
                    ///     过滤，默认(false)并不过滤，true则过滤html的&gt;&lt;标签，也可以传递一个函数作为过滤函数，函数最终必须返回一个良好的Document或xml字符串标签
                    /// </param>
                    /// <returns type="X" />
                    var fuck = new DOMParser();
                    var testHTML = textContent(item).replace(/&gt;/g, '>').replace(/&lt;/g, '<');
                    var test = fuck.parseFromString(testHTML, 'text/xml');
                    var hehe = test.documentElement;
                    itemsDOM.push(hehe);
                    return self;
                },
                find: function (xPath, context) {
                    /// <summary>
                    ///     1: 基于xpath或标签查找
                    ///     &#10;    1.1 - find(xPath[,context])：基于xpath查找
                    ///     &#10;    1.1 - find(tag[,context])：基于tag查找
                    /// </summary>
                    /// <param name="xPath" type="String">
                    ///     xpath或tag标签
                    /// </param>
                    /// <param name="context" type="Document">
                    ///     查找上下文
                    /// </param>
                    /// <returns type="X" />
                    context = context || doc;
                    if (!xpath) return [];
                    //ie:selectNodes

                    //webkit||firefox||IE>=10
                    var xResult = new XPathEvaluator(), nodes = [], node, nodeList;
                    nodeList = xResult.evaluate(xpath, context, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
                    while (node = nodeList.iterateNext())
                        nodes.push(node);
                    return self;
                },
                text: function (value) {
                    if (xpath && xpath.nodeType) {
                        return xpath.firstChild ? xpath.firstChild.nodeValue : '';
                    }
                    var temp = find(xpath, doc);
                    return temp[0] ? textContent(temp[0]) : '';
                },
                attr: function () {

                },
                parent: function () {

                },
                child: function () {

                },
                next: function () {

                },
                sibling: function () {

                },
                has: function () {

                },
                clone: function () {

                },
                slice: function () {

                },
                spliceChild: function () {

                },
                splice: function () {

                }
            };
        return self;
    };
}(window));