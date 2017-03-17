/**
 * Created by artyom.grishanov on 18.01.17.
 */
var panoDrawing = {};
(function canvas(global) {
    // эти настройки покаж жестко заданы
    // выставлены на примере картинки 6000x3562, но на 1600x1000 уже другие надо
    var PIN_PADDING = 10, PIN_COLOR = '#33bbed', PIN_FONT_COLOR = '#ffffff', PIN_FONT_HEIGHT = 14, BACK_COLOR = '#aaa', PIN_FONT_FAMILY = 'Arial';
    /**
     * Зона размытия между картинкой и полосками
     * @type {number}
     */
    var BLUR_ZONE = 20;
    var panoCanvas = null;
    var configPano = null;


//    /**
//     * Определить примерный размер пина
//     * Применяется при нормализации существующих пинов, когда картинка обновляется, чтобы они не вылезли за край
//     *
//     * @param {String} text
//     * @param {number} scale
//     */
//    function getPinSize(text, scale) {
//
//    }

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
        ctx.globalAlpha = 0.8;
        ctx.fillRect(pinCornerLeft, pinCornerTop, pinWidth, pinHeight)
        ctx.globalAlpha = 1;
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

        if (param.img.height !== panoCanvas.height) {
            // нужны дополнительные полоски чтобы выдержать размер и размытие
            var bc = createBlurredCanvas(param.img, panoCanvas.width, panoCanvas.height);
            ctx.drawImage(bc, 0, 0);

            // плавный переход от картинки к заблюренному фону
            var imgCanvas = document.createElement('canvas');
            imgCanvas.width = param.img.width;
            imgCanvas.height = param.img.height;
            var imgCtx = imgCanvas.getContext('2d');

            drawGradientMask(imgCtx, 0, 0, param.img.width, param.img.height);
            imgCtx.globalCompositeOperation = 'source-in';
            imgCtx.drawImage(param.img, 0, 0);
            imgCtx.globalCompositeOperation = 'source-over';

            var dx = Math.round((panoCanvas.width-param.img.width)/2);
            var dy = Math.round((panoCanvas.height-param.img.height)/2);
            ctx.drawImage(imgCanvas, dx, dy);
        }
        else {
            ctx.drawImage(param.img, 0, 0);
        }


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

    function drawGradientMask(ctx, dx, dy, w, h) {
        var gradient = ctx.createLinearGradient(dx,dy,dx,dy+BLUR_ZONE);
        gradient.addColorStop(0,"rgba(111,111,111,0)");
        gradient.addColorStop(1,"rgba(111,111,111,1)");
        ctx.fillStyle = gradient;
        ctx.fillRect(dx,dy,w,BLUR_ZONE);
        ctx.fillStyle = '#999';
        ctx.fillRect(dx,dy+BLUR_ZONE,w,h-BLUR_ZONE*2);
        gradient = ctx.createLinearGradient(dx,dy+h-BLUR_ZONE,dx,dy+h);
        gradient.addColorStop(0,"rgba(111,111,111,1)");
        gradient.addColorStop(1,"rgba(111,111,111,0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(dx,dy+h-BLUR_ZONE,w,BLUR_ZONE);
    }

    /**
     *
     * @param srcCanvas
     * @param destWidth
     * @param destHeight
     * @returns {HTMLElement|*}
     */
    function createBlurredCanvas(srcCanvas, destWidth, destHeight) {
        var blurredCanvas = document.createElement('canvas');
        blurredCanvas.width = destWidth;
        blurredCanvas.height = destHeight;
        var ctx = blurredCanvas.getContext('2d');
        if (ctx.filter === 'none') {
            // поддерживается новый механизм фильтров
            ctx.filter = 'blur(50px)';
            ctx.drawImage(srcCanvas,0,0,srcCanvas.width,srcCanvas.height,
                0,0,destWidth,destHeight);
        }
        else {
            var proxyCanvas = document.createElement('canvas');
            proxyCanvas.width = Math.round(srcCanvas.width/4);
            proxyCanvas.height = Math.round(srcCanvas.height/4);
            var pctx = proxyCanvas.getContext('2d');
            pctx.drawImage(srcCanvas,0,0,srcCanvas.width,srcCanvas.height,
                0,0,proxyCanvas.width,proxyCanvas.height);

            var r = Math.max(destWidth/proxyCanvas.width,destHeight/proxyCanvas.height);
            var dw = r * proxyCanvas.width;
            var dh = r * proxyCanvas.height;
            var dx = (destWidth-dw)/2;
            var dy = (destHeight-dh)/2;
            ctx.drawImage(proxyCanvas,0,0,proxyCanvas.width,proxyCanvas.height,
                dx,dy,dw,dh);

            ctx.globalAlpha = 0.8;
            ctx.fillStyle = '#888';
            ctx.fillRect(0,0,destWidth,destHeight);
            ctx.globalAlpha = 1;
        }
        return blurredCanvas;
    }

    global.createPanoCanvas = createPanoCanvas;

})(panoDrawing);