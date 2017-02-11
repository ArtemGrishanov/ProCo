/**
 * Created by artyom.grishanov on 28.12.16.
 */

var panoConfig = {};
(function(global) {
    var errorData = {};
    /**
     * Рассчет параметров цилиндрической панорамы исходя из того, что она показывается
     * внутри сферы. Отношение сторон панорамы всегда 2:1. А реальная картинка меньше
     * https://developers.google.com/streetview/spherical-metadata#euler_overview
     * Наблюдатель видит полоску (реальное изображение) находясь внутри сферы.
     *
     * Если неудалось создать конфигурацию по причине некорректного hfov в процессе расчета, то вернется null
     * Информация об этом внутри errorData, наиболее длизкие параметры srcWidth и srcHeight
     *
     * @param srcWidth
     * @param srcHeight
     * @param {{boolean}} param.is360 делать круговую или нет
     * @param {{number}} param.vfov
     */
    function createConfig(srcWidth, srcHeight, param) {
        param = param || {};
        param.is360 = param.is360 || false;
        param.vfov = param.vfov || undefined;
        errorData = null;
        var MAX_HFOV = 180;
        var MIN_PANO_SRC_WIDTH = 1600;
        var MIN_PANO_SRC_HEIGHT = 1200;
        // based on facebook documention
        var MAX_IMG_WIDTH = 6000;
        var vfovInfo = getVFOVinfo(srcWidth, srcHeight, param.vfov);
        if (!!vfovInfo===false) {
            return null;
        }
        var VFOV_OPTIMAL = vfovInfo.vfov;

        if (srcWidth > MAX_IMG_WIDTH) {
            srcWidth = MAX_IMG_WIDTH;
        }
        var result = {
            srcWidth: srcWidth,
            srcHeight: srcHeight,
            targetVFOV: VFOV_OPTIMAL,
            type: 'cylindrical' // функция заточена под цилиндрическую панораму
        };

        var srcHFOV = getHFOV(srcWidth, srcHeight, vfovInfo.magic);
        // либо 0..180 или 360
        if (param.is360) {
            if (srcHFOV!==360) {
                var r = 360/vfovInfo.magic;
                errorData = {
                    errorHFOV: srcHFOV,
                    targetVFOV: VFOV_OPTIMAL,
                    srcWidth: srcWidth,
                    srcHeight: Math.round(srcWidth/r)
                };
                errorData.srcHFOV = getHFOV(errorData.srcWidth, errorData.srcHeight, vfovInfo.magic);
                return null;
            }
        }
        else {
            if (srcHFOV > MAX_HFOV) {
                var r = MAX_HFOV/vfovInfo.magic;
                errorData = {
                    errorHFOV: srcHFOV,
                    targetVFOV: VFOV_OPTIMAL,
                    srcWidth: srcWidth,
                    srcHeight: Math.round(srcWidth/r)
                };
                errorData.srcHFOV = getHFOV(errorData.srcWidth, errorData.srcHeight, vfovInfo.magic);
                return null;
            }
        }

        if (srcHFOV) {
            // расчет по известному srcHFOW проще
            result.srcHFOV = srcHFOV;
            result.id = srcWidth+'x'+srcHeight+'_'+result.srcHFOV;
            result.panoWidth = Math.round(360/srcHFOV*srcWidth);
            result.panoHeight = Math.floor(result.panoWidth/2);
            result.croppedWidth = srcWidth;
            result.croppedHeight = Math.floor(result.panoHeight*VFOV_OPTIMAL/180);
            result.croppedX = Math.round((result.panoWidth-result.croppedWidth)/2);
            result.croppedY = Math.round((result.panoHeight-result.croppedHeight)/2);
        }
//    else {
//        // это всегда так, картинку показываем максимально по ширине
//        result.croppedWidth = srcWidth;
//        //TODO ???  по ФБ это число меньше. По гугл туториалу это фактическая высота
//        result.croppedHeight = srcHeight;//2867;//srcHeight;
//
//        // высоту берем при условии вертикального угла обзора в 86 градусов
//        result.panoHeight = Math.round(result.croppedHeight*180/VFOW_OPTIMAL);
//        // полные размеры панорамы panoWidth:panoHeight всегда в отношении 2:1
//        result.panoWidth = result.panoHeight*2;
//
//        result.croppedX = Math.round((result.panoWidth-result.croppedWidth)/2);
//        result.croppedY = Math.round((result.panoHeight-result.croppedHeight)/2);
//
//        result.srcHFOV = Math.round(result.croppedWidth/result.panoWidth*360);
//        result.id = srcWidth+'x'+srcHeight+'_'+result.srcHFOV;
//    }

        var xmpTemplate = '<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.0-c061 64.140949, 2010/12/07-10:57:01"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:GPano="http://ns.google.com/photos/1.0/panorama/" rdf:about=""><GPano:CroppedAreaImageHeightPixels>{{croppedHeight}}</GPano:CroppedAreaImageHeightPixels><GPano:CroppedAreaImageWidthPixels>{{croppedWidth}}</GPano:CroppedAreaImageWidthPixels><GPano:CroppedAreaLeftPixels>{{croppedX}}</GPano:CroppedAreaLeftPixels><GPano:CroppedAreaTopPixels>{{croppedY}}</GPano:CroppedAreaTopPixels><GPano:FullPanoHeightPixels>{{panoHeight}}</GPano:FullPanoHeightPixels><GPano:FullPanoWidthPixels>{{panoWidth}}</GPano:FullPanoWidthPixels><GPano:ProjectionType>{{type}}</GPano:ProjectionType></rdf:Description></rdf:RDF></x:xmpmeta>';
        result.xmp = xmpTemplate;
        var exifCommandTemplate = 'exiftool -FullPanoWidthPixels={{panoWidth}} -FullPanoHeightPixels={{panoHeight}} -CroppedAreaLeftPixels={{croppedX}} -CroppedAreaTopPixels={{croppedY}} -CroppedAreaImageWidthPixels={{croppedWidth}} -CroppedAreaImageHeightPixels={{croppedHeight}} -ProjectionType={{type}}';
        result.exifCommand = exifCommandTemplate;
        for (var key in result) {
            result.xmp = result.xmp.replace('{{'+key+'}}',result[key]);
            result.exifCommand = result.exifCommand.replace('{{'+key+'}}',result[key]);
        }
        return result;
    }

    function getPanoramaTemplate(srcWidth, srcHeight) {
        var srcRatio = srcWidth/srcHeight;
        var result = panoramaTemplates[0];
        var resultRatio = result.width/result.height;
        for (var i = 0; i < panoramaTemplates.length; i++) {
            var cr = panoramaTemplates[i].width/panoramaTemplates[i].height;
            if (Math.abs(srcRatio-resultRatio)>Math.abs(srcRatio-cr)) {
                resultRatio = cr;
                result = panoramaTemplates[i];
            }
        }
        return result;
    }

    /**
     * Рассчитать горизонтальный угол обзора для указанных размеров картинки.
     * MAGIC_FB_PANORAMA_NUMBER - соотношение между пропорциями картинки и ее углом обзора
     *
     * @param scrWidth
     * @param scrHeight
     */
    function getHFOV(srcWidth, srcHeight, magic) {
        return Math.round((srcWidth/srcHeight)*magic);
    }

// MAGIC_FB_PANORAMA_NUMBER = hfov / (width/height)
// height = width / (hfov / MAGIC_FB_PANORAMA_NUMBER);
//var MAGIC_FB_PANORAMA_NUMBER = 106.86;
//var MAGIC_FB_PANORAMA_NUMBER = 73.02; //360/(6000/1217); //65
//var MAGIC_FB_PANORAMA_NUMBER = 73.02; //44
    var vfov_info = [
        {
            minRatio: 0,
            maxRatio: 3.99,
            magic: 106.86,
            vfov: 86
        },
        {
            // для более узких картинок: когда высота по крайней мере в 4 раза меньше ширины
            minRatio: 4,
            maxRatio: 1000,
            magic: 73.02,
            vfov: 65
        }
    ];
    /**
     * Позволяет подобрать оптимальные коэффициенты на основе пропорций картинок
     * @param srcWidth
     * @param srcHeight
     * @returns {*}
     */
    function getVFOVinfo(srcWidth, srcHeight, vfov) {
        if (vfov) {
            for (var i = 0; i < vfov_info.length; i++) {
                if (vfov === vfov_info[i].vfov) {
                    return vfov_info[i];
                }
            }
        }
        else {
            var r = srcWidth/srcHeight;
            var result = null;
            for (var i = 0; i < vfov_info.length; i++) {
                if (vfov_info[i].minRatio <= r && r <= vfov_info[i].maxRatio) {
                    result = vfov_info[i];
                }
            }
            return result;
        }
        return null;
    }
    var panoramaTemplates = [
        {
            //my, tested
            width: 6000,
            height: 3664,
            hfov: 175,
            vfov: 86
        },
        {
            width: 6000,
            height: 5343, //1.12
            hfov: 120,
            vfov: 86
        },
        {
            width: 6000,
            height: 4274, //1.40
            hfov: 150,
            vfov: 86
        },
        {
            width: 6000,
            height: 3562, //1.68
            hfov: 180,
            vfov: 86
        },
        {
            width: 6000,
            height: 2671, //2.25
            hfov: 240,
            vfov: 86
        },
        {
            width: 6000,
            height: 2137, //2.81
            hfov: 300,
            vfov: 86
        },
        {
            width: 6000,
            height: 1781, //3.37
            hfov: 360,
            vfov: 86
        },
        {
            width: 6000,
            height: 1217, //4.93
            hfov: 360,
            vfov: 65
        }
    ];
    for (var i = 0; i < panoramaTemplates.length; i++) {
        var t = panoramaTemplates[i];
        t.ratio = t.width / t.height;
        t.k1 = t.hfov / t.ratio;
    }

    function testConfigs(assert) {
        var assert = assert || {
            ok: function(check, message) {
                if (check===true) {
                    return true;
                }
                if (message) {
                    console.error(message);
                }
                else {
                    console.error('Assert: failed.');
                }
            }
        };

        for (var i = 0; i < panoramaTemplates.length; i++) {
            var t = getPanoramaTemplate(panoramaTemplates[i].width, panoramaTemplates[i].height);
            assert.ok(t.hfov === panoramaTemplates[i].hfov, 'Correct hfov for '+ t.width + 'x' + t.height);
            assert.ok(t.vfov === panoramaTemplates[i].vfov, 'Correct vfov for '+ t.width + 'x' + t.height);
        }
    }

    testConfigs();

    global.createConfig = createConfig;
    global.getErrorData = function() { return errorData; };

})(panoConfig);