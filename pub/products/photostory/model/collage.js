/**
 * Created by artyom.grishanov on 01.02.18.
 */
var collage = {};
(function canvas(global) {

    var COLLAGE_WIDTH = 800;
    var COLLAGE_HEIGHT = 500;
    var COLLAGE_BACK_COLOR = '#00ffff';

    var collageSchema = {
        // расписано размещение картинок для каждого их количестве
        // в массиве столько элементов, сколько картинок указано в свойстве
        '1': [
            {
                width: 210,
                height: 210,
                top: 0,
                left: 0
            }
        ],
        '4': [
            {
                width: 210,
                height: 210,
                top: 0,
                left: 0
            },
            {
                width: 76,
                height: 76,
                top: 50,
                left: 50
            },
            {
                width: 76,
                height: 76,
                top: 50,
                left: 50
            },
            {
                width: 76,
                height: 76,
                top: 50,
                left: 50
            }
        ]
    };

    /**
     * Канвас для отрисовки, на нем получается итоговый результат
     * @type {canvas}
     */
    var collageCanvas = null;

    /**
     * Отрисовать коллаж
     *
     * @param {Array.<Images>} images - массив объектов Image, уже загруженных и готовых к отрисовке
     */
    function draw(images) {
        var collageCanvas = document.createElement('canvas');
        collageCanvas.width = COLLAGE_WIDTH;
        collageCanvas.height = COLLAGE_HEIGHT;
        var ctx = collageCanvas.getContext('2d');
        ctx.fillStyle = COLLAGE_BACK_COLOR;
        ctx.fillRect(0, 0, collageCanvas.width, collageCanvas.height)

        if (images.length > 0) {
            var schemaImageIndex = 0;
            var schemaImage = getCollageSchema(images.length);
            for (var i = 0; i < images.length; i++) {
                var img = images[i];
                ctx.drawImage(img, schemaImage.left, schemaImage.top, schemaImage.width, schemaImage.height);

                // blur

                // align
            }
        }

        return collageCanvas;
    }

    /**
     * Найти для указанного количества картинок подходящее распределение для отрисовки
     *
     * @param {Number} imagesCount
     */
    function getCollageSchema(imagesCount) {
        var possiblePhotoCounts = []; //[1,4,7];
        for (var key in collageSchema) {
            // достаем из схемы размещения все возможные количества из которых может состоять коллаж
            if (collageSchema.hasOwnProperty(key) === true) {
                possiblePhotoCounts.push(parseInt(key));
            }
        }
        var photosInCollage = 0;
        for (var i = possiblePhotoCounts.length-1; i >= 0; i--) {
            if (imagesCount >= possiblePhotoCounts[i]) {
                photosInCollage = possiblePhotoCounts[i];
                break;
            }
        }
        return collageSchema[photosInCollage];
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

    global.draw = draw;

})(collage);