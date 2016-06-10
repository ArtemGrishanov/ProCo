/**
 * Created by artyom.grishanov on 24.01.16.
 */
function Slide(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);
    this.loadDirective(function(response, status, xhr){
        this.$directive.click(function(){
            showScreen(Array.isArray(propertyString)?propertyString:propertyString.split(','));
        });
    });
    this.onScreenUpdate = function(e) {
        //перерисовывать только когда экран реально виден пользователю, только активный экран
        //activeScreens - последние показанные экраны
        var p = (Array.isArray(this.propertyString))?this.propertyString.join(','):this.propertyString;
        if (activeScreens.join(',') == p) {
            var arr = (Array.isArray(this.propertyString))?this.propertyString:[this.propertyString];
            showScreen(arr);
        }
        if (config.common.generateSlidePreviews === true) {
            this.updatePreview();
        }
    };
    // помним, что контрол может отвечать сразу за несколько экранов
    // подписка на обновления экрана в движке, контрол будет запрашивать у редактора перерисовку
    var arr = (Array.isArray(this.propertyString))?this.propertyString:[this.propertyString];
    for (var i = 0; i < arr.length; i++) {
        Engine.on('ScreenUpdated', arr[i], this.onScreenUpdate.bind(this));
    }

    this.updatePreview = function() {
        //TODO not working yet
        // успешно работает только создание превью для одного активного экрана
        // для всех экранов, даже в очереди, в либе html2canvas валится эксепшн
        try {
            var view = (Array.isArray(this.propertyString)) ?
                    Engine.getAppScreen(this.propertyString[0]).view :
                    Engine.getAppScreen(this.propertyString).view;

            var clonedView = $(view).clone().css('transform','scale(0.21)').css('transform-origin','top left');
            //TODO
            var $previewDocument = this.$directive.find('.js-preview_iframe').contents();
            $previewDocument.find('head').append('<link href="../products/test/style.css" rel="stylesheet"/>');
            $previewDocument.find('body').css('margin',0);
            $previewDocument.find('body').empty().append(clonedView);
//            previewService.create(view, (function(canvas) {
//                this.$directive.empty().append($(canvas).css('width','166px')); // 166 - ширине slide
//            }).bind(this), 'rasterizeHTML');

        }
        catch(e) {
            log('Can not create preview on screen \''+p+'\'', true);
        }
    };

    if (config.common.generateSlidePreviews === true) {
       // this.updatePreview();
    }
}
Slide.prototype = AbstractControl;
/**
 * Angular контроллер, для управления view
 * имя состоит из двух частей: 'Имя контрола'+'Controller'
 *
 * @param $scope область видимости из angular
 * @param $attrs дополнительные атрибуты, например dom элемент внутри
 */
function SlideController(scope, attrs) {
//    // может быть указано несколько экрано для одного контрола Slide
//    var appProperties = attrs.$$element.parent().attr('data-app-property');
//    var scrIds = appProperties.split(',');
//    scope.slideClicked = function() {
//        // просим редактор показать скрин по его ид
//        showScreen(scrIds);
//    }
}