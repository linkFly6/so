(function () {
    var data = [{ name: 'linkFly', blog: 'http://www.cnblogs.com/silin6/' }],//拿到数据
        html = ['<ul>'],
        $container = $('#container');
    //拼接为HTML
    data.forEach(function (item) {
        html.push('<li>', item.name, ' - ', item.blog);
    });
    html.push('</ul>');
    //展现到页面
    $container.html(html.join(''));
})();

