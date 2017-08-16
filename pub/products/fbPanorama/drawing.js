/**
 * Created by artyom.grishanov on 18.01.17.
 */
var panoDrawing = {};
(function canvas(global) {
    // эти настройки покаж жестко заданы
    // выставлены на примере картинки 6000x3562, но на 1600x1000 уже другие надо
    var PIN_PADDING = 8, PIN_COLOR = '#33bbed', PIN_FONT_COLOR = '#ffffff', PIN_FONT_HEIGHT = 12, MIN_PIN_WIDTH = 50,
        BACK_COLOR = '#aaa', PIN_FONT_FAMILY = 'Arial',
        LOGO_RIGHT = 50,
        LOGO_BOTTOM = 50,
        FONT_SIZE_AR_HEIGHT = 1.2, // отношение размера шрифта к высоте стрелки
        LOGO_HEIGHT_PERCENT_FROM_PANO_HEIGHT = 0.05 // высота лого в процентах от высоты панорамы
        ;
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
     * @param param.text
     * @param param.modArrow [ar_bottom, ar_bottom_left, ar_bottom_right, ar_top, ar_top_left, ar_bottom_right]
     * @param param.canvas
     * @param param.pinScale
     * @param param.backgroundColor цвет фона стикера
     * @param param.color цвет текста стикера
     */
    function addPin(param) {
        var ctx = param.context;
        param.pinScale = param.pinScale || 1;
        var fontSize = Math.round(param.pinScale * PIN_FONT_HEIGHT);
        var minPinWIdth = Math.round(param.pinScale * MIN_PIN_WIDTH);
        var padding = Math.round(param.pinScale * PIN_PADDING);
        var x = param.left, y = param.top;
        param.text = param.text.replace(/(&nbsp;)+/g," ");
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
        var pinWidth = 2*padding;
        if (maxLineWidth < minPinWIdth) {
            pinWidth += minPinWIdth;
        }
        else {
            pinWidth += maxLineWidth;
        }
        var pinHeight = lines.length * fontSize + 2*padding;
        var pinCornerLeft = x;//-pinWidth/2;
        var pinCornerTop = y;//-pinHeight/2;
        ctx.fillStyle = (param.backgroundColor) ? param.backgroundColor : PIN_COLOR;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(pinCornerLeft, pinCornerTop, pinWidth, pinHeight)

        // стрелочка
        var arHeight = fontSize / FONT_SIZE_AR_HEIGHT;
        var arWidth = arHeight * 2;
        var textAlign = 'left';
        switch(param.modArrow) {
            case 'ar_bottom': {
                drawTriangle(ctx, pinCornerLeft+pinWidth/2-arWidth/2, pinCornerTop+pinHeight, arWidth, 0, arWidth/2, arHeight);
                textAlign = 'center';
                break;
            }
            case 'ar_bottom_left': {
                drawTriangle(ctx, pinCornerLeft, pinCornerTop+pinHeight, arWidth/2, 0, 0, arHeight);
                break;
            }
            case 'ar_bottom_right': {
                drawTriangle(ctx, pinCornerLeft+pinWidth, pinCornerTop+pinHeight, 0, arHeight, -arWidth/2, 0);
                textAlign = 'right';
                break;
            }
            case 'ar_top': {
                drawTriangle(ctx, pinCornerLeft+pinWidth/2-arWidth/2, pinCornerTop, arWidth, 0, arWidth/2, -arHeight);
                textAlign = 'center';
                break;
            }
            case 'ar_top_left': {
                drawTriangle(ctx, pinCornerLeft, pinCornerTop, 0, -arHeight, arWidth/2, 0);
                break;
            }
            case 'ar_top_right': {
                drawTriangle(ctx, pinCornerLeft+pinWidth, pinCornerTop, 0, -arHeight, -arWidth/2, 0);
                textAlign = 'right';
                break;
            }
        }

        // текст внутри пина
        var yy = padding+pinCornerTop;
        var xx = pinCornerLeft+padding;
        ctx.textAlign = textAlign;
        // выравнивание текста на канвасе имеет другую логику, недели в css
        // подробнее: https://www.w3schools.com/tags/canvas_textalign.asp
        switch(textAlign) {
            case 'center': {
                xx = pinCornerLeft+pinWidth/2;
                break;
            }
            case 'right': {
                xx = pinCornerLeft+pinWidth-padding;
                break;
            }
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = (param.color) ? param.color : PIN_FONT_COLOR;
        for (var i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], xx, yy);
            yy += fontSize;
        }
    }

    /**
     * Отрисовка треугольника; Интерфейс функции выбран для укорачивания записи
     *
     * @param ctx
     * @param startX стартовая точка, глобальные координаты
     * @param startY стартовая точка, глобальные координаты
     * @param dx1
     * @param dy1
     * @param dx2
     * @param dy2
     */
    function drawTriangle(ctx, startX, startY, dx1, dy1, dx2, dy2) {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX+dx1, startY+dy1);
        ctx.lineTo(startX+dx2, startY+dy2);
        ctx.fill();
    }

    /**
     * @param {string} param.img картинка
     * @param {Array} param.pins пины (отметки) на панораме
     * @param {number} param.srcWidth
     * @param {number} param.srcHeight
     * @param {number} param.pinScale
     * @param {Image} param.logo
     * @param {string} param.pinsBackgroundColor
     */
    function createPanoCanvas(param) {
        // размер картинки может оказаться больше чем srcWidth srcHeight, так как конфигурация берется из расчета максимальной ширины 6000px
        var imgScale = param.srcWidth / param.img.width;
        //
        var panoCanvas = document.createElement('canvas');
        panoCanvas.width = param.srcWidth;
        panoCanvas.height = param.srcHeight;
        var ctx = panoCanvas.getContext('2d');
        ctx.fillStyle = BACK_COLOR;
        ctx.fillRect(0, 0, panoCanvas.width, panoCanvas.height)

        if (param.srcHeight !== param.img.height) {
            // нужны дополнительные полоски чтобы выдержать размер и размытие
            var bc = createBlurredCanvas(param.img, panoCanvas.width, panoCanvas.height);
            ctx.drawImage(bc, 0, 0);

            // плавный переход от картинки к заблюренному фону
            var imgCanvas = document.createElement('canvas');
            imgCanvas.width = param.srcWidth;
            imgCanvas.height = param.srcHeight;
            var imgCtx = imgCanvas.getContext('2d');

            drawGradientMask(imgCtx, 0, 0, param.img.width*imgScale, param.img.height*imgScale);
            imgCtx.globalCompositeOperation = 'source-in';
            imgCtx.drawImage(param.img, 0, 0, param.img.width, param.img.height, 0, 0, param.img.width*imgScale, param.img.height*imgScale);
            imgCtx.globalCompositeOperation = 'source-over';

            // выравнивание по вертикали нужно, чтобы картинка оказалась по середине заблюренного фона
            var dx = Math.round((panoCanvas.width-param.img.width*imgScale)/2);
            var dy = Math.round((panoCanvas.height-param.img.height*imgScale)/2);
            ctx.drawImage(imgCanvas, dx, dy);
        }
        else {
            ctx.drawImage(param.img, 0, 0);
        }

        if (param.logo) {
            var lh = panoCanvas.height * LOGO_HEIGHT_PERCENT_FROM_PANO_HEIGHT;
            var lw = lh / (param.logo.height/param.logo.width);
            ctx.drawImage(param.logo,
                panoCanvas.width - lw - LOGO_RIGHT,
                panoCanvas.height - lh - LOGO_BOTTOM,
                lw,
                lh
            );
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
                    pinScale: param.pinScale,
                    modArrow: p.modArrow,
                    backgroundColor: param.pinsBackgroundColor,
                    color: p.color
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