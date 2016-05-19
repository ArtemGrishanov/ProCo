/**
 * Created by artyom.grishanov on 19.05.16.
 *
 * Это действие которое надо сделать при определенных действиях с промо проектом в редакторе
 * Пример: вызов функцию установки правильного ответа при клики в буллиты ответа.
 *
 * @param {object} appScreen - экран промо приложения
 * @param {object} params - параметры из дескриптора
 */
function ClickTrigger(appScreen, params) {
    if (!params.cssSelector) {
        log('ClickTrigger: cssSelector property is mandatory', true);
        return;
    }
    this.onClick = function(e) {
        if (params.callParams) {
            var attr = $(e.currentTarget).attr(params.callParams);
            if (params.onEventClass) {
                $(this.elements).removeClass(params.onEventClass);
                $(e.currentTarget).addClass(params.onEventClass);
            }
            if (params.callParams) {
                //TODO разве iframeWindow должен находиться в глобальном контексте?
                iframeWindow[params.callMethod](attr);
            }
        }
    };
    this.elements = $(appScreen.view).find(params.cssSelector).click(this.onClick.bind(this));
}