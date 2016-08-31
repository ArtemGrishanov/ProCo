/**
 * Created by artyom.grishanov on 31.08.16.
 */

/**
 * Находит айфрейм содержащий приложение с нужным ид.
 * В процессе автотестирования может быть создано несколько айфремов в приложениями. Надо уметь отличать один от другого
 *
 * @param container
 * @param appId
 * @returns {*}
 */
function findIframeWithApp(container, appId) {
    var iframes = $(container).find('iframe');
    for (var i = 0; i < iframes.length; i++) {
        if (iframes[i].contentWindow.app && iframes[i].contentWindow.app.id === appId) {
            return iframes[i];
        }
    }
    return null;
}