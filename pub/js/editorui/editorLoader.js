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

    var _clbOnload = null;
    var _appIframe = null;
    var _appName = null;
    var _editedApp = null;

    /**
     * Будет создан iframe и в src указан url на приложение, например %hostName%+'products/test_new/index.html'
     *
     * @param {string} param.appName - одно из доступных приложений, например 'memoriz' или 'personality'
     * @param {domElement} param.container - куда помещать iframe с приложением
     * @param {function} onload
     */
    function load(param) {
        param = param || {};
        if (param.appName && param.container) {
            _appName = param.appName;
            if (param.onload) {
                _clbOnload = param.onload;
            }
            // по имени промо приложения получаем ссылку на его код
            var src = config.products[param.appName].src;
            if (src) {
                _appIframe = document.createElement('iframe');
                _appIframe.onload = _onIframeload;
                $(_appIframe).addClass('proto_cnt');//.addClass('__hidden'); why __hidden ?
                _appIframe.src = config.common.home+src;
                $(param.container).empty().append(_appIframe);
            }
            else {
                throw new Error('editorLoader.load: cannot find src for: \''+param.appName+'\'', true);
            }
        }
        else {
            throw new Error('editorLoader.load: appName or container does not specified');
        }
    }

    /**
     * Рестартануть приложение
     * Применение:
     * 1) при переходе из режиме редактирования и режим предпросмотра и обратно
     * 2) В автотестах
     *
     * @param {string} param.mode - 'edit' | 'preview' | 'published'
     * @param {*} param.defaults
     * @param {function} param.onAppChanged
     *
     * @return MutApp;
     */
    function startApp(param) {
        //TODO приложение автоматически запускается при загрузке iframe, в редакторе это двойной запуск
        param = param || {};
        param.mode = param.mode || 'none';
        if (_editedApp) {
            delete _editedApp;
        }
        var cfg = config.products[_appName];
        _editedApp = new _appIframe.contentWindow[cfg.constructorName]({
            mode: param.mode,
            width: cfg.defaultWidth,
            height: cfg.defaultHeight,
            defaults: param.defaults || null,
            appChangeCallbacks: param.appChangeCallbacks || null
            //engineStorage: JSON.parse(JSON.stringify(appStorage)) todo?
        });
        _editedApp.start();
        return _editedApp;
    }

    function _onIframeload() {
        _editedApp = _appIframe.contentWindow.app;
        if (_clbOnload) {
            _clbOnload();
        }
    }

    global.load = load;
    global.startApp = startApp;
    global.getIframe = function() { return _appIframe; }
    global.getApp = function() { return _editedApp; }

})(editorLoader);