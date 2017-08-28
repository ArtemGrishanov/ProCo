/**
 * Created by artyom.grishanov on 24.04.17.
 */
var directiveLoader = {};
(function(global){

    var resultCallback = null;
    var isReady = false;
    var allDirectiveNames = null;
    var directives = {};

    /**
     * по информации config.controls.ControlName.directives построить весь список директив, подлежащих загрузке
     * @private
     *
     * @return {Array.<string>} array if all directive names in the editor
     */
    function _builAllDirectiveNames() {
        var result = [];
        var controlInfo = null;
        var dirName = null;
        for (var k in config.controls) {
            controlInfo = config.controls[k];
            if (controlInfo.directives) {
                for (var i = 0; i < controlInfo.directives.length; i++) {
                    dirName = controlInfo.directives[i];
                    if (result.indexOf(dirName) < 0) {
                        result.push(dirName);
                    }
                }
            }
        }
        return result;
    }

    /**
     * Создать задачу для загрузки директивы для контрола
     * @param {string} directiveName
     * @private
     */
    function _createLoadTask(directiveName) {
        var t = {
            run: function () {
                var $d = $('<div></div>').load(config.common.home+'controls/view/'+directiveName+'.html', (function(response, status, xhr) {
                    Queue.release(this);
                    _saveDirective(directiveName, $($d.html()));

                    // Проверить готовность всех шаблонов директив и вызвать result callback
                    if (_isAllDirectivesLoaded() === true && resultCallback) {
                        resultCallback();
                    }

                    // var duration = new Date().getTime() - this.startTime;
                    // console.log('ABSTRACT_CONTROL: '+control.propertyString+'.'+control.directiveName+' DIRECTIVE LOADED. destroyed=='+control.destroyed+' Duration='+duration);
                }).bind(this));
            },
            onFail: function() {
                // var duration = new Date().getTime() - this.startTime;
                // console.log('ABSTRACT_CONTROL: '+control.propertyString+'.'+control.directiveName+' ON FAIL. destroyed=='+control.destroyed+' Duration='+duration);
            }
        };
        Queue.push(t);
    }

    /**
     * Проверить все ли шаблоны директив загружены
     * @returns {boolean}
     * @private
     */
    function _isAllDirectivesLoaded() {
        for (var i = 0; i < allDirectiveNames.length; i++) {
            if (typeof directives[allDirectiveNames[i]] !== 'string') {
                return false
            }
        }
        return true;
    }

    /**
     * Сохранить шаблон для директивы
     *
     * @param {string} directiveName
     * @param {string} template
     * @private
     */
    function _saveDirective(directiveName, template) {
        var $e = $('<div></div>').append(template);
        if (window.App) {
            window.App.localize($e);
        }
        directives[directiveName] = $e.html();
    }

    /**
     * Начать загрузку всех шаблонов для директив
     *
     * @param {Function} callback - будет вызвана после окончания загрузки
     */
    function load(callback) {
        if (allDirectiveNames === null) {
            resultCallback = callback;
            allDirectiveNames = _builAllDirectiveNames();
            for (var i = 0; i < allDirectiveNames.length; i++) {
                _createLoadTask(allDirectiveNames[i]);
            }
        }
    }

    /**
     * Получить шаблон по имени директивы
     *
     * @param {string} directiveName
     * @returns {string}
     */
    function getDirective(directiveName) {
        return directives[directiveName];
    }

    global.load = load;
    global.getDirective = getDirective;
    global._getDirectives = function() { return directives; }

})(directiveLoader);