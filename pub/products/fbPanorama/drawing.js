/**
 * Created by artyom.grishanov on 18.01.17.
 */
var panoDrawing = {};
(function canvas(global) {
    // эти настройки покаж жестко заданы
    // выставлены на примере картинки 6000x3562, но на 1600x1000 уже другие надо
    var PIN_PADDING = 10, PIN_COLOR = '#33bbed', PIN_FONT_COLOR = '#ffffff', PIN_FONT_HEIGHT = 16, BACK_COLOR = '#aaa', PIN_FONT_FAMILY = 'Times New Roman';

    var panoCanvas = null;
    var configPano = null;

    /**
     *
     * @param param.canvas
     * @param param.pinScale
     */
    function addPin(param) {
        var ctx = param.context;
        param.pinScale = param.pinScale || 1;
        var fontSize = Math.round(param.pinScale * PIN_FONT_HEIGHT);
        var padding = Math.round(param.pinScale * PIN_PADDING);
        var x = param.left, y = param.top;
        param.text = param.text.replace(/(&nbsp;)*/g,"");
        var lines = param.text.split('<br>');
        ctx.font = fontSize + "px " + PIN_FONT_FAMILY;
        ctx.textBaseline = 'top';
        var maxLineWidth = 0;
        for (var i = 0; i < lines.length; i++) {
            var lw = ctx.measureText(lines[i]).width;
            if (lw > maxLineWidth) {
                maxLineWidth = lw;
            }
        }
        var pinWidth = maxLineWidth + 2*padding;
        var pinHeight = lines.length * fontSize + 2*padding;
        var pinCornerLeft = x;//-pinWidth/2;
        var pinCornerTop = y;//-pinHeight/2;
        ctx.fillStyle = PIN_COLOR;
        ctx.fillRect(pinCornerLeft, pinCornerTop, pinWidth, pinHeight)
        ctx.fillStyle = PIN_FONT_COLOR;
        var yy = padding+pinCornerTop;
        for (var i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], pinCornerLeft+padding, yy);
            yy += fontSize;
        }
    }

    /**
     * @param {string} param.img картинка
     * @param {Array} param.pins пины (отметки) на панораме
     * @param {number} param.width
     * @param {number} param.height
     * @param {number} param.pinScale
     */
    function createPanoCanvas(param) {
        var panoCanvas = document.createElement('canvas');
        panoCanvas.width = param.width;
        panoCanvas.height = param.height;
        var ctx = panoCanvas.getContext('2d');
        ctx.fillStyle = BACK_COLOR;
        ctx.fillRect(0, 0, panoCanvas.width, panoCanvas.height)
        var dx = Math.round((panoCanvas.width-param.img.width)/2);
        var dy = Math.round((panoCanvas.height-param.img.height)/2);
        ctx.drawImage(param.img, dx, dy);

        if (param.pins) {
            var p = null;
            for (var i = 0; i < param.pins.length; i++) {
                p = param.pins[i];
                addPin({
                    context: ctx,
                    text: p.data.text,
                    left: p.position.left,
                    top: p.position.top,
                    pinScale: param.pinScale
                });
            }
        }
        return panoCanvas;
    }

    global.createPanoCanvas = createPanoCanvas;

})(panoDrawing);