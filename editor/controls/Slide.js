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
        this.updatePreview();
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
//        try {
//            var t = {
//                run: (function() {
//                    var view = (Array.isArray(this.propertyString)) ?
//                        Engine.getAppScreen(this.propertyString[0]).view :
//                        Engine.getAppScreen(this.propertyString).view;
//                    //$('#id-screens_preview_cnt').empty().append(view);
//                    html2canvas(view,{
//                        onrendered: (function(canvas) {
//                            // canvas is the final rendered <canvas> element
//                            this.$directive.empty().append($(canvas).css('width','166px')); // 166 - ширине slide
//                            //$('#id-screens_preview_cnt').empty();
//                            Queue.release(t);
//                        }).bind(this)
//                    })
//                }).bind(this)
//            };
//            Queue.push(t);
//        }
//        catch(e) {
//            log('Can not create preview on screen \''+p+'\'', true);
//        }
    };
    this.updatePreview();
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