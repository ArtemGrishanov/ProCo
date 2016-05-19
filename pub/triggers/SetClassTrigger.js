/**
 * Created by artyom.grishanov on 19.05.16.
 *
 * @param {object} appScreen - экран промо приложения
 * @param {object} params - параметры из дескриптора
 */
function SetClassTrigger(appScreen, params) {
    if (!params.cssSelector) {
        log('SetClassTrigger: cssSelector property is mandatory', true);
        return;
    }
    this.elements = $(appScreen.view).find(params.cssSelector);
    this.elements.removeClass(params.activeClass);
    //TODO это похоже на какой-то язык шаблонов, которые часто встречаются в js frameworks
    // способ откуда брать данные: screen:currentQuestionIndex
    //
    //TODO заточка в получении данных от экрана
    if (appScreen.data.hasOwnProperty('currentQuestion')) {
        var correntAnswerId = iframeWindow[params.callMethod](appScreen.data.currentQuestion);
        if (correntAnswerId) {
            for (var i = 0; i < this.elements.length; i++) {
                if ($(this.elements[i]).attr(params.attr) === correntAnswerId) {
                    $(this.elements[i]).addClass(params.activeClass);
                }
            }
        }
    }
}