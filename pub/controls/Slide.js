/**
 * Created by artyom.grishanov on 24.01.16.
 */
function Slide(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);
    // в это body будет вставляться превью слайда
    this.$previewDocumentBody = null;
    this.$previewIFrame = null
    this.previewScale = undefined;
    /**
     * Установка свойства propertyString
     * Это сделано только в контроле Slide для быстродействия, так как там очень заметен негативный эффект
     * @param propertyString
     */
    this.setPropertyString = function(propertyString) {
        if (this.propertyString !== propertyString) {
            this.propertyString = propertyString;
            this.$directive.attr('data-app-property',this.propertyString);
            if (config.common.generateSlidePreviews === true) {
                this.updatePreview();
            }
        }
    };
    /**
     * Событие на загрузку айфрейма, тут мы сможем его подготовить для создания превью слайда
     */
    this.onPreviewIFrameLoaded = function() {
        var $previewDocument = this.$previewIFrame.contents();
        // TODO стили промопроекта как сюда попадут?
        $previewDocument.find('head').append(getProjectStandartCssLink());
        this.$previewDocumentBody = $previewDocument.find('body').css('margin',0).css('overflow','hidden');
        // создание первого превью
        if (config.common.generateSlidePreviews === true) {
            this.updatePreview();
        }
    };
    // загрузить UI контрола
    this.loadDirective(function(response, status, xhr){
        // подготовка компонента к работе с превью
        this.$previewIFrame = $(this.$directive.find('.js-preview_iframe'));
        // проверяем загружен iframe или еще нет
        var $previewDocument = this.$previewIFrame.contents();
        if ($previewDocument && $previewDocument.find('head') && $previewDocument.find('body')) {
            this.onPreviewIFrameLoaded();
        }
        else {
            this.$previewIFrame.load(this.onPreviewIFrameLoaded.bind(this));
        }
        this.$directive.mousedown((function() {
            var p = (Array.isArray(this.propertyString))?this.propertyString.join(','):this.propertyString;
            if (activeScreens.join(',') !== p) {
                showScreen(Array.isArray(propertyString)?propertyString:propertyString.split(','));
            }
        }).bind(this));
    });
    /**
     *
     * @param {string} screenId ид экрана который обновился
     */
    this.onScreenUpdate = function(screenId) {
        //перерисовывать только когда экран реально виден пользователю, только активный экран
        //activeScreens - последние показанные экраны

        // Схлопнутые экраны.
        // например, this.propertyString = [result1, resul2, result3]
        // приходит из события screenId = result2
        // TODO но в таком случае как сделать обновление единожды? А не в каждом событии
//        var p = (Array.isArray(this.propertyString))?this.propertyString.join(','):this.propertyString;
        if ((typeof this.propertyString==='string' && screenId===this.propertyString) ||
            (Array.isArray(this.propertyString) && this.propertyString.indexOf(screenId)>=0)) {
            // это этот экран
            if (activeScreens.join(',') == this.propertyString) {
                var arr = (Array.isArray(this.propertyString))?this.propertyString:[this.propertyString];
                showScreen(arr);
            }
            if (config.common.generateSlidePreviews === true) {
                this.updatePreview();
            }
        }
    };
    // помним, что контрол может отвечать сразу за несколько экранов
    // подписка на обновления экрана в движке, контрол будет запрашивать у редактора перерисовку
    var arr = (Array.isArray(this.propertyString))?this.propertyString:[this.propertyString];
    for (var i = 0; i < arr.length; i++) {
        Engine.on('ScreenUpdated', null/*arr[i]*/, this.onScreenUpdate.bind(this));
    }

    this.updatePreview = function() {
        try {
            if (this.$previewDocumentBody) {
                var view = (Array.isArray(this.propertyString)) ?
                        Engine.getAppScreen(this.propertyString[0]).view :
                        Engine.getAppScreen(this.propertyString).view;
                if (this.previewScale === undefined) {
                    this.previewScale = this.$previewIFrame.width() / appSize.width;
                }
                var clonedView = $(view).clone().css('transform','scale('+this.previewScale+')').css('transform-origin','top left');
                this.$previewDocumentBody.empty().append(clonedView);
            }
        }
        catch(e) {
            log('Can not create preview on screen \''+this.propertyString+'\'', true);
        }
    };

    //if (config.common.generateSlidePreviews === true) {
       // this.updatePreview();
    //}
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