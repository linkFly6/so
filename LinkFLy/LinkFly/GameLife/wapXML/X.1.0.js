/*!
* Copyright 2014 linkFLy - http://www.cnblogs.com/silin6/
* Released under the MIT license
* http://opensource.org/licenses/mit-license.php
* Date: 2014-8-24 20:17:18
*/
(function (window, undefined) {
    var push = Array.prototype.push,
        splice = Array.prototype.splice,
        indexOf = Array.prototype.indexOf,
        slice = Array.prototype.slice,
        String = Object.prototype.toString,
        document = window.document,
        each = Array.prototype.forEach,
        class2type = {},
        XType = function (obj) {
            return obj == null ? String(obj) : class2type[String.call(obj)] || "object";
        },
        isFunction = function (fn) {
            return XType(fn) === 'function';
        },
        isArrayLike = function (obj) {
            if (obj == null) return false;
            var length = obj.length, type = XType(obj);
            if (obj == obj.window)
                return true;
            if (obj.nodeType === 1 && length)
                return true;
            return type === 'array' || type !== 'function' && (length === 0 || typeof length === 'number' && length > 0 && (length - 1) in obj);
        },
        isXPath = function (xPath) {
            return XType(xPath) === 'string' && xPath != null && (xPath.indexOf('/') !== -1 || xPath.indexOf('[') !== -1 || xPath.indexOf('@') !== -1);
        },
        domParser = new DOMParser();

    'Boolean Number String Function Array Date RegExp Object'.split(' ').forEach(function (name) {
        class2type['[object ' + name + ']'] = name.toLowerCase();
    });
    var X = function (xml, filter) {
        /// <summary>
        ///     1: 创建操作XML的X对象,document或者xml是用于生成上下文的，所以务必要给定
        ///     &#10;    1.1 - X(xml[,filter])：基于xml字符串生成
        ///     &#10;    1.2 - X(document[,filter])：基于document对象生成
        ///     &#10;    1.3 - X(document[,xPath])：基于document，并用给定的xPath生成
        ///     &#10;    1.4 - X(document[,NodeList])：基于document，并用给定的NodesList生成
        /// </summary>
        /// <param name="xml" type="String">
        ///     xml文本或document对象
        /// </param>
        /// <param name="filter" type="boolean">
        ///     过滤，默认(false)并不过滤，true则过滤html的&gt;&lt;标签，也可以传递一个函数作为过滤函数，函数最终必须返回一个良好的Document或xml字符串标签
        /// </param>
        /// <returns type="X" />
        var doc = document, add = function (item) {
            if (isArrayLike(item))
                each.call(item, function (elem) {
                    add(elem);
                });
            else if (item.nodeType)
                push.call(self, item);
        };
        if (xml && xml.constructor === X) return xml;
        if (XType(xml) === 'string') {
            try {
                doc = domParser.parseFromString(xml, 'text/xml');
            } catch (e) {
                //                console.log(e);
            }
        } else if (X.isXML(xml))
            doc = xml;
        var self = {
            version: 'linkFLy.X.1.1',
            constructor: X,
            document: doc,
            length: 0,
            documentElement: doc.documentElement,
            find: function (xPath, context) {
                /// <summary>
                ///     1: 基于xpath或标签查找
                ///     &#10;    1.1 - find(xPath[,context])：基于xpath查找
                ///     &#10;    1.1 - find(tag[,context])：基于tag查找
                /// </summary>
                /// <param name="xPath" type="String">
                ///     xpath或tag标签（提供tag查找但不推荐，尽量使用xpath，tag查找会查找文档下所有的tag，所以会丢失查找精度）
                /// </param>
                /// <param name="context" type="Document">
                ///     查找上下文
                /// </param>
                /// <returns type="X" />
                return X(context || doc, xPath);
            },
            text: function (value) {
                /// <summary>
                ///     1: 获取或设置Element中的文本
                ///     &#10;    1.1 - text()：获取
                ///     &#10;    1.2 - text(value)：设置
                /// </summary>
                /// <param name="value" type="String">
                ///     获取或设置的值
                /// </param>
                /// <returns type="X" />
                if (!arguments.length && value == undefined) {
                    var first = self[0];
                    return (first && first.firstChild && first.firstChild.nodeValue) || '';
                }
                if (self.length)
                    each.call(self, function (item) {
                        item.firstChild.nodeValue = value;
                    });
                return self;
            },
            attr: function (attr, value) {
                /// <summary>
                ///     1: 获取或设置Element的属性
                ///     &#10;    1.1 - attr(attr)：获取
                ///     &#10;    1.2 - attr(attr,value)：设置
                /// </summary>
                /// <param name="value" type="String">
                ///     获取或设置的属性
                /// </param>
                /// <returns type="X" />
                if (arguments.length === 2) {
                    value = value == undefined ? '' : value;
                    if (self.length)
                        each.call(self, function (item) {
                            item.setAttribute(attr, value);
                        });
                    return self;
                }
                var first = self[0];
                return first && first.getAttribute && first.getAttribute(attr) || '';
            }
        };
        if (filter) {
            if (filter.nodeType === 1) {//element
                add(filter);
                filter = null;
            } else if (isFunction(filter)) {//fucntion
                filter = filter.call(doc);
            } else if (isXPath(filter)) { //xpath
                //webkit || IE>8    if you want to support IE<=8 : selectNodes
                var xResult = new XPathEvaluator(), node, nodeList;
                nodeList = xResult.evaluate(filter, self.documentElement, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
                while (node = nodeList.iterateNext()) {
                    add(node);
                }
                filter = null;
            } else {
                //dom tag
                filter = self.document.getElementsByTagName(filter + '');
            }
            if (isArrayLike(filter)) {
                each.call(filter, function (item) {
                    add(item);
                });
            }
        }
        [
            ['eq', function (args) {
                /// <summary>
                ///     1: 获取指定索引中的X对象
                ///     &#10;    1.1 - eq(index)：基于xpath查找
                /// </summary>
                /// <param name="index" type="Int">
                ///     索引
                /// </param>
                /// <returns type="X" />
                return X(this[args[0]]);
            }],
            ['slice', function (args) {
                /// <summary>
                ///     1: 截取X对象中指定开始索引到结束索引的X对象，返回的是一个全新的X对象
                ///     &#10;    1.1 - slice(start[,end])：基于xpath查找
                /// </summary>
                /// <param name="index" type="Int">
                ///     开始索引
                /// </param>
                /// <param name="end" type="Int">
                ///     结束索引，默认全部截取
                /// </param>
                /// <returns type="X" />
                return X(doc, slice.call(this.list, args[0] || 0, args[1] || this.list.length - 1));
            }],
            ['splice', function (args) {
                /// <summary>
                ///     1: 参考数组splice方法 - 向/从X对象中添加/删除项目，然后返回被删除的项目
                ///     &#10;    1.1 - splice(index,howmany,item1)：向/从X对象中添加/删除项目，然后返回被删除的项目
                /// </summary>
                /// <param name="index" type="Int">
                ///     规定添加/删除的位置
                /// </param>
                /// <param name="howmany" type="Int">
                ///     要删除的数量
                /// </param>
                /// <param name="item1" type="Int">
                ///     向X追加的新项
                /// </param>
                /// <returns type="X" />
                var items = [args[0] || 0, args[1] || 0].concat(slice.call(args, 2));
                return X(doc, splice.apply(this, items));
            }]
        ].forEach(function (array) {
            self[array[0]] = function () {
                if (!self.length) return null;
                return array[1].call(self, arguments);
            };
        });
        //如果需要判定是否是X对象类型，请使用 constructor===X 而不要使用 instanceof()
        return self;
    };
    X.isXML = function (doc) {
        return doc && doc.createElement && doc.createElement('P').nodeName === doc.createElement('p').nodeName;
    };
    window.X = X;
})(window);
