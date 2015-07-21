(function ($) {
    var Foo = function ($elem) {
        //doSomething($elem)
    };
    Foo.prototype.bar = function () { };


    $.fn.foo = function () {
        //jQuery是类数组对象：http://www.cnblogs.com/silin6/p/ArrayLike.html
        this.each(function () {
            //循环每个DOM
            var $this = $(this),
                data = $this.data('bar');//获取每个DOM上挂载的名为bar的数据
            if (!data) {
                //如果没有数据，则创建一个我们的组件对象，并和这个DOM关联
                data = new Foo($this);
                $this.data('bar', data);
            };
            return data;//返回我们的组件对象
        });
    };

    //调用方式：$('#baz').foo().bar();

})(jQuery);
