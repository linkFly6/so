/*!
* Copyright 2014 linkFLy - http://www.cnblogs.com/silin6/
* Released under the MIT license
* http://opensource.org/licenses/mit-license.php
* Date: 2014-8-24 20:17:18
*/
(function (window, undefined) {
    'use strcit';
    var push = Array.prototype.push,
        splice = Array.prototype.splice,
        slice = Array.prototype.slice,
        toString = Object.prototype.toString,
        document = window.document,
        each = Array.prototype.forEach,
        class2type = {},
        XType = function (obj) {
            return obj == null ? toString(obj) : class2type[toString.call(obj)] || "object";
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
            // invalid 'in' operand obj，in 操作符对字符串无效
            return type === 'array' || type !== 'function' && type !== 'string' && (length === 0 || typeof length === 'number' && length > 0 && (length - 1) in obj);
        },
        domParser = new DOMParser(),
        xPathEvaluator = new XPathEvaluator(),
        isNode = function (node) {
            /// <summary>
            ///     &#10;    1.1 - isNode(node)：检测一个对象是否是Element或Element
            /// </summary>
            /// <param name="node" type="Object">
            ///     要检测的对象
            /// </param>
            /// <returns type="boolean" />
            var nodeType = node && node.nodeType;
            return nodeType && nodeType === 1 || nodeType === 9;
        },
        find = function (xPath, context) {
            /// <summary>
            ///     X.find(xPath,context) - 根据上下文（context）查找XML元素
            /// </summary>
            /// <param name="xPath" type="String">
            ///     *xPath
            /// </param>
            /// <param name="context" type="Element">
            ///     *XML查找上下文
            /// </param>
            /// <returns type="Array" />
            //webkit || IE>8    if you want to support IE<=8 : selectNodes
            var nodeList = [], isStr = XType(xPath) === 'string', node;
            if (!isStr) return nodeList;
            if (isArrayLike(context)) {
                each.call(context, function (elem) {
                    nodeList = nodeList.concat(find(xPath, elem));
                });
                return nodeList;
            }
            if (!isNode(context)) return nodeList;
            try {
                result = xPathEvaluator.evaluate(xPath, context, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
                while (node = result.iterateNext())
                    nodeList.push(node);
            } catch (e) { }
            return nodeList;
        },
        addElem = function (target, item) {
            /// <summary>
            ///     &#10;    1.1 - addElem(target, item)：追加一组元素（item）到目标（target）中
            /// </summary>
            /// <param name="target" type="X">
            ///     X对象
            /// </param>
            /// <param name="item" type="Elements">
            ///     可以是Element、NodeList、ArrayLike
            /// </param>
            /// <returns type="Array" />
            if (isArrayLike(item))
                each.call(item, function (elem) {
                    addElem(target, elem);
                });
            else if (isNode(item))
                push.call(target, item);
        };

    'Boolean Number String Function Array Date RegExp Object'.split(' ').forEach(function (name) {
        class2type['[object ' + name + ']'] = name.toLowerCase();
    });
    var X = function (xml, xPath) {
        /// <summary>
        ///     1: 创建操作XML的X对象,document或者xml是用于生成上下文的，所以务必要给定
        ///     &#10;    1.1 - X(xml)：基于xml字符串生成
        ///     &#10;    1.2 - X(document[,xPath])：基于document对象生成，并可以根据指定的xPath生成
        ///     &#10;    1.3 - X(Element[,xPath])：基于Element，并可以根据指定的xPath生成
        ///     &#10;    1.4 - X(NodeList)：基于NodeList生成
        /// </summary>
        /// <param name="xml" type="String">
        ///     *xml文本或document对象
        /// </param>
        /// <param name="filter" type="boolean">
        ///     过滤，默认(false)并不过滤，true则过滤html的&gt;&lt;标签，也可以传递一个函数作为过滤函数，函数最终必须返回一个良好的Document或xml字符串标签
        /// </param>
        /// <returns type="X" />
        if (!(this instanceof X))
            return new X(xml, xPath);
        if (!xml) return;
        var context = [];
        //[object String]
        if (XType(xml) === 'string') {
            try {
                context.push(domParser.parseFromString(xml, 'text/xml'));
            } catch (e) {
                //console.log(e);
            }
        } else if (isNode(xml))//Element or Document
            context.push(xml);
        else if (isArrayLike(xml))//X Object or ArrayLike
            context = xml;
        if (XType(xPath) === 'string')
            addElem(this, find(xPath, context));
        else if (xml instanceof X)
            return xml;
        else
            addElem(this, context);
    };

    X.prototype = {
        veresion: 'linkFly.X.1.2',
        constructor: X,
        length: 0,
        find: function (xPath, context) {
            /// <summary>
            ///     1: 基于xpath或标签查找
            ///     &#10;    1.1 - find(xPath[,context])：基于xpath查找
            /// </summary>
            /// <param name="xPath" type="String">
            ///     xpath
            /// </param>
            /// <param name="context" type="Document">
            ///     查找上下文
            /// </param>
            /// <returns type="X" />
            return X(context || this, xPath);
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
                var first = this[0];
                return (first && first.firstChild && first.firstChild.nodeValue) || '';
            }
            if (this.length)
                each.call(this, function (item) {
                    item.firstChild.nodeValue = value;
                });
            return this;
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
                if (this.length)
                    each.call(this, function (item) {
                        item.setAttribute(attr, value);
                    });
                return this;
            }
            var first = this[0];
            return first && first.getAttribute && first.getAttribute(attr) || '';
        },
        each: function (fn) {
            /// <summary>
            ///     1: 循环X对象中的每项（并不含XML DOM）
            ///     &#10;    1.1 - each(fn)：获取
            /// </summary>
            /// <param name="fn" type="Function">
            ///     每次循环要执行的函数，该函数this指向当前循环的XML元素（Element），第一个参数是该元素的X对象封装，第二个是索引，第三个整个XML文档的上下文
            /// </param>
            /// <returns type="X" />
            if (!isFunction(fn)) return;
            for (var i = 0, len = this.length; i < len; i++)
                if (fn.call(this[i], this[i], i) === false) return false;
            return this;
        }
    };

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
                return X(slice.call(this, args[0] || 0, args[1] || this.length - 1));
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
                return X(splice.apply(this, items));
            }]
    ].forEach(function (array) {
        X.prototype[array[0]] = function () {
            if (!this.length) return null;
            return array[1].call(this, arguments);
        };
    });

    X.isXML = function (doc) {
        /// <summary>
        ///    X.isXML(doc) -  检测一个Document对象是否是XML Document
        /// </summary>
        /// <param name="doc" type="Document">
        ///     要检测的XML Document
        /// </param>
        /// <returns type="Array" />
        return doc && doc.createElement && doc.createElement('P').nodeName !== doc.createElement('p').nodeName;
    };
    X.find = find;
    window.X = X;
})(window);
