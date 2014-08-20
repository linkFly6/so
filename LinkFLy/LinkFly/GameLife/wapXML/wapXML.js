var find = function (xpath, context) {
    /// <summary>
    ///     1: 基于xpath查找
    ///     &#10;    1.1 - contains(obj)
    /// </summary>
    /// <param name="xpath" type="String">
    ///     xpath
    /// </param>
    /// <param name="context" type="Object">
    ///     查找上下文
    /// </param>
    /// <returns type="Array" />
    context = context || document;
    if (!xpath) return [];
    //ie:selectNodes

    //webkit||firefox||IE>=10
    var xResult = new XPathEvaluator(), nodes = [], node, nodeList;
    nodeList = xResult.evaluate(xpath, context, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    while (node = nodeList.iterateNext())
          nodes.push(node);
    return nodes;
},
textContent = function (xpath, doc) {
        //xml不能使用innerHTML获取值
        if (xpath && xpath.nodeType) {
            return xpath.firstChild ? xpath.firstChild.nodeValue : '';
        }
        var temp = find(xpath, doc);
        return temp[0] ? textContent(temp[0]) : '';
};