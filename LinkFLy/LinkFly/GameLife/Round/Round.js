(function () {
    var option = {
        colors: ['#abd9ea', '#c5b0ed'],
        //, '#ed7e89', '#fbaca7', '#fed17e', '#a0dcac'
        breakPx: 0,
        width: 100,
        start: 0,
        x: 50,
        y: 50,
        lineWidth: 20,
        deep: 40
    },
        colorReg =
        extend = function () {
            if (arguments.length !== 2) return {};
            var target = arguments[0] || {},
                source = arguments[1] || {};
            for (var key in source) {
                if (!target[key])
                    target[key] = source[key];
            }
            return target;
        },
        val = function (value) {
            //百分比转角度再转弧度
            return (value > 0 ? value / 100 : value) * 360 * Math.PI / 180;
        },
        Round = function (elem, config) {
            if (typeof (elem) === 'string' || elem.nodeType !== 1) {
                elem = document.getElementById(elem.toString());
            };
            config = extend(config, option);
            var canvas = elem && elem.getContext && elem.getContext('2d'),
                start = config.start,
                lastColor = undefined,
                tempRandom = undefined,
                self = {
                    getColor: function (color) {
                        if (color === undefined) {
                            //随机颜色不能和上一个重复
                            while ((tempRandom = Math.floor(Math.random() * config.colors.length)) === lastColor);
                            lastColor = tempRandom;
                            console.log(lastColor);
                            return config.colors[lastColor];
                        }
                        return lastColor = -1 && typeof (color) === 'string' && color.indexOf('#') !== -1 ? color : config.colors[color];
                    },
                    //这里的值按照百分比来给定
                    draw: function (value, color) {
                        if (canvas && value <= 100) {
                            //画扇形：arc(x坐标，y坐标，半径，扇形弧度起点，扇形弧度终点，顺时针（true）或逆时针（false）)
                            //canvas.arc(config.x, config.y, config.deep, val(start), val(start + value - config.breakPx));
                            //start += value;
                            ////线宽
                            //canvas.lineWidth = config.lineWidth;
                            ////线颜色
                            //canvas.strokeStyle = self.getColor(color);
                            ////对线条的操作，所以描边
                            //canvas.stroke();
                            //canvas.beginPath(); //标识路径重新绘制


                            /*
                                填充式写法：
                            */
                            canvas.fillStyle = self.getColor(color);
                            canvas.beginPath(); //开始绘图
                            canvas.moveTo(50, 50);
                            canvas.arc(config.x, config.y, config.deep, val(start), val(start + value - config.breakPx));
                            start += value;
                            canvas.fill(); //开始绘图

                        }
                        return self;
                    },
                    reDraw: function (value, color) {
                        //从最初的原点开始画图
                        var temp = start;
                        start = 0;
                        self.draw(value, color);
                        start = temp;
                        return self;
                    }
                };
            return self;
        };
    window.so = window.so || {};
    window.so.Round = Round;
}());