/**
 * Created by artyom.grishanov on 18.01.17.
 */
var panoDrawing = {};
(function canvas(global) {
    // эти настройки покаж жестко заданы
    var PIN_PADDING = 20, PIN_COLOR = '#33bbed', PIN_FONT_COLOR = '#ffffff', PIN_FONT_HEIGHT = 90;

    var panoCanvas = null;
    var configPano = null;

    /**
     *
     * @param param.canvas
     */
    function addPin(param) {
        var ctx = param.context;
        var x = param.left, y = param.top;
        param.text = param.text.replace(/(&nbsp;)*/g,"");
        var lines = param.text.split('<br>');
        ctx.font = PIN_FONT_HEIGHT + "px Arial";
        ctx.textBaseline = 'top';
        var maxLineWidth = 0;
        for (var i = 0; i < lines.length; i++) {
            var lw = ctx.measureText(lines[i]).width;
            if (lw > maxLineWidth) {
                maxLineWidth = lw;
            }
        }
        var pinWidth = maxLineWidth + 2*PIN_PADDING;
        var pinHeight = lines.length * PIN_FONT_HEIGHT + 2*PIN_PADDING;
        var pinCornerLeft = x;//-pinWidth/2;
        var pinCornerTop = y;//-pinHeight/2;
        ctx.fillStyle = PIN_COLOR;
        ctx.fillRect(pinCornerLeft, pinCornerTop, pinWidth, pinHeight)
        ctx.fillStyle = PIN_FONT_COLOR;
        var yy = PIN_PADDING+pinCornerTop;
        for (var i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], pinCornerLeft+PIN_PADDING, yy);
            yy += PIN_FONT_HEIGHT;
        }
    }

    /**
     * @param {string} param.img картинка
     * @param {Array} param.pins пины (отметки) на панораме
     * @param {number} param.width
     * @param {number} param.height
     */
    function createPanoCanvas(param) {
        var panoCanvas = document.createElement('canvas');
        panoCanvas.width = param.width;
        panoCanvas.height = param.height;
        var ctx = panoCanvas.getContext('2d');
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
                    top: p.position.top
                });
            }
        }
        return panoCanvas;
    }

    global.createPanoCanvas = createPanoCanvas;

})(panoDrawing);