/**
 * Created by artyom.grishanov on 01.09.17.
 *
 * Идея модуля в том, чтобы вынести загрузку mutapp приложения для редактирования в отдельный модуль.
 * Именно для редактирования в editor. Для опубликованных приложений есть loader.js
 * Это нужно для автотестов и в целом для уменьшения связности.
 *
 */

var editorLoader = {};

(function(global) {

    /**
     * Информация о загруженных приложениях
     * Разделение по ид контейнера
     * то есть в редакторе можно загрузить несколько приложений в разные контейнеры
     *
     * @type {containerId: {clbOnLoad, appIframe, appName, app}}
     * @private
     */
    var _loadedInfo = {};

    /**
     * Будет создан iframe и в src указан url на приложение, например %hostName%+'products/test_new/index.html'
     *
     * @param {string} param.containerId - id (без '#'), куда помещать iframe с приложением*
     * @param {string} param.appName - одно из доступных приложений, например 'memoriz' или 'personality'
     * @param {string} param.devIframeUrl - способ загрузки приложения по прямому урлу айфрейма
     * @param {string} param.devConstructorName - при загрузке айфрейма надо указать имя конструктора
     * @param {Number} param.devWidth - в режиме разработчика
     * @param {Number} param.devHeight - в режиме разработчика
     * @param {function} onload
     */
    function load(param) {
        param = param || {};
        if ((param.appName && param.containerId) || param.devIframeUrl) {
            _loadedInfo[param.containerId] = {
                appName: param.appName,
                devIframeUrl: param.devIframeUrl,
                devConstructorName: param.devConstructorName,
                devWidth: param.devWidth,
                devHeight: param.devHeight
            }
            if (param.onload) {
                _loadedInfo[param.containerId].clbOnLoad = param.onload;
            }
            // по имени промо приложения получаем ссылку на его код
            var src = null;
            if (param.appName && config.products[param.appName].src) {
                // урл на приложение можно установить по разному в зависимости от параметров
                // сначала пробуем установить на основе param.appName
                src = config.common.home + config.products[param.appName].src;
            }
            else {
                // далее пробуем установить по параметру для девелоперов
                src = param.devIframeUrl;
            }
            if (src) {
                var fr = document.createElement('iframe');
                fr.onload = _onIframeload;
                $(fr).addClass('proto_cnt');
                fr.src = src;
                var $cnt = $('#'+param.containerId);
                if ($cnt && $cnt.length > 0) {
                    $cnt.empty().append(fr);
                }
                else {
                    throw new Error('editorLoader.load: container with id: \''+param.containerId+'\' did not found');
                }
                _loadedInfo[param.containerId].appIframe = fr;
            }
            else {
                throw new Error('editorLoader.load: cannot find src for: \''+param.appName+'\'');
            }
        }
        else {
            throw new Error('editorLoader.load: appName or containerId does not specified');
        }
    }

    /**
     * Рестартануть приложение
     * Применение:
     * 1) Запуск приложений в редакторе: отдельное приложение редактирования и отдельное предпросмотра
     * 2) В автотестах
     *
     * @param {string} containerId
     * @param {string} param.mode - 'edit' | 'preview' | 'published'
     * @param {*} param.defaults
     * @param {function} param.onAppChanged
     *
     * @return MutApp;
     */
    function startApp(param) {
        param = param || {};
        if (!param.containerId) {
            throw new Error('EditorLoader.startApp: containerId does not specified');
        }
        param.mode = param.mode || 'none';
        var inf = _loadedInfo[param.containerId];
        if (inf.app) {
            delete inf.app;
        }
        // если у проекта есть имя (проект стандартный) то берем го настройки из конфига
        // иначе пробуем применить режим разработчика
        var cfg = (inf.appName) ? config.products[inf.appName]: {
            constructorName: inf.devConstructorName,
            defaultWidth: inf.devWidth || 800,
            defaultHeight: inf.devHeight || 600
        };
        if (cfg.constructorName && inf.appIframe.contentWindow[cfg.constructorName]) {
            inf.app = new inf.appIframe.contentWindow[cfg.constructorName]({
                mode: param.mode,
                locale: App.getLang(),
                width: cfg.defaultWidth,
                height: cfg.defaultHeight,
                defaults: param.defaults || null,
                appChangeCallbacks: param.appChangeCallbacks || null
                //engineStorage: JSON.parse(JSON.stringify(appStorage)) todo?
            });
            if (inf.app.start) {
                inf.app.start();
            }
            else {
                throw new Error('editorLoader.startApp: start() method is not defined in app');
            }
            $(inf.appIframe).css('border','0')
                .css('width','100%')
                .css('height','100%')
                .css('max-width', inf.app.getSize().width)
                .css('max-height', inf.app.getSize().height);
            return inf.app;
        }
        else {
            throw new Error('editorLoader.startApp: constructor name is illegal or is not specified "'+cfg.constructorName+'"');
        }
        return null;
    }

    function _onIframeload(e) {
        var pid = $(e.currentTarget).parent().attr('id');
        if (_loadedInfo.hasOwnProperty(pid) === true) {
            var inf = _loadedInfo[pid];
            inf.app = inf.appIframe.contentWindow.app;
            if (inf.clbOnLoad) {
                inf.clbOnLoad({
                    containerId: pid
                });
            }
        }
        else {
            throw new Error('EditorLoader._onIframeload: container with id \'' + pid + ' does not found');
        }
    }

    global.load = load;
    global.startApp = startApp;
    global.getIframe = function(containerId) { return _loadedInfo[containerId].appIframe; }
    global.getApp = function(containerId) { return _loadedInfo[containerId].app; }

})(editorLoader);