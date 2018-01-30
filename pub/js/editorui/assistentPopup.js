/**
 * Created by artyom.grishanov on 02.10.17.
 *
 * Панель в виде popup, с информацией о проекте, ошибками, подсказками.
 */
var AssistentPopup = {};

(function(global) {

    var _$view = null;
    var _$messagesCnt = null;
    var _onContinueCallback = null;
    var _onCloseCallback = null;
    /**
     * See more types https://developers.google.com/chart/interactive/docs/gallery/piechart
     * @type {Array}
     */
    var GOOGLE_SUPPORTED_VISUALIZATION_TYPES = ['PieChart'];
    /**
     * Собственные разработанные чарты которые находятся в pub/charts
     * @type {Array}
     */
    var CUSTOM_VISUALIZATION_TYPES = ['TriviaChart'];

    function init(param) {
        param = param || {};
        _onContinueCallback = param.continueCallback;
        _onCloseCallback = param.closeCallback;
        _$messagesCnt = $('#id-assistent_cnt');
        _$view = $('#id-assistent');
        _$view.hide();
        _$view.find('.js-close').click(_onCloseClick.bind(this));
        _$view.find('.js-cancel').click(_onCloseClick.bind(this));
        _$view.find('.js-continue').click(_onContinueClick.bind(this));
    }

    /**
     * Установить подсказки в диалог
     *
     *
     * @param {Array} messages
     * Для каждого элемента из messages могут быть
     // m.title
     // m.type
     // m.html
     // m.message
     // m.visualization
     */
    function setMessages(messages) {
        _$messagesCnt.empty();
        for (var i = 0; i < messages.length; i++) {
            var m = messages[i];
            var $item = $('<div class="assyst_i"></div>');
            _$messagesCnt.append($item); // итем должен быть сразу в дом дереве
            if (m.title) {
                $('<p class="assyst_i_title">'+_parseText(m.title)+'</p>').appendTo($item);
            }
            if (m.message) {
                var $msgcnt = $('<p class="assyst_i_msg_cnt"></p>').appendTo($item);
                if (m.type === 'warning') {
                    $('<span class="assyst_i_warn_ico"></span>').appendTo($msgcnt);
                }
                $('<span class="assyst_i_msg_text">'+_parseText(m.message)+'</span>').appendTo($msgcnt);
            }
            if (m.html) {
                $('<div class="assyst_i_html"></div>').html(m.html).appendTo($item);
            }
            if (m.visualization && m.visualization.type && m.visualization.data) {
                if (GOOGLE_SUPPORTED_VISUALIZATION_TYPES.indexOf(m.visualization.type) >= 0) {
                    var data = google.visualization.arrayToDataTable(m.visualization.data);
                    var options = {
                        title: m.visualization.title || '',
                        // опытным путем подобрал
                        // изначально при left=0 диаграмма почему-то смещена вправо
                        chartArea: {left:-40,top:0,width:'80%',height:'80%'}
                    };
                    var chartid = m.visualization.type+'_'+getUniqId();
                    $('<div id="'+chartid+'"></div>').appendTo($item);
                    var chart = new google.visualization[m.visualization.type](document.getElementById(chartid));
                    chart.draw(data, options);

                    // хак. Место для легенды очень узкое по умолчанию
                    $('#'+chartid+' svg[aria-label="A chart."').width(600);
                }
                else if (CUSTOM_VISUALIZATION_TYPES.indexOf(m.visualization.type) >= 0) {
                    var chartid = m.visualization.type+'_'+getUniqId();
                    $('<div id="'+chartid+'"></div>').appendTo($item);
                    var chart = new TriviaChart(document.getElementById(chartid));
                    chart.draw(m.visualization.data);
                }
                else {
                    throw new Error('AssistentPopup.setMessages: unsupported visualization type \''+ m.visualization.type+'\'');
                }
            }
        }
    }

    /**
     * Надо распарсить, если надо, объект в зависимости от выбранной локали
     *
     * @param {string | object} txtData - объект локализации или сразу строка
     * @private
     * @return {string}
     */
    function _parseText(txtData) {
        if (typeof txtData === 'string') {
            return txtData;
        }
        else if (typeof txtData[App.getLang()] === 'string') {
            return txtData[App.getLang()];
        }
        return null;
    }

    /**
     * Показать popup
     *
     * @param {boolean} param.showContinueButton
     */
    function show(param) {
        param = param || {};
        if (param.showContinueButton === true) {
            _$view.find('.js-cancel').show();
            _$view.find('.js-continue').show();
        }
        else {
            _$view.find('.js-cancel').hide();
            _$view.find('.js-continue').hide();
        }
        _$view.show();
    }

    /**
     * Скрытие
     */
    function hide() {
        _$view.hide();
    }

    /**
     * Показана ли панель или нет
     *
     * @returns {boolean}
     */
    function isShown() {
        return _$view.css('display') === 'block';
    }

    /**
     * Клик на кнопку закрытия
     */
    function _onCloseClick() {
        hide();
        if (_onCloseCallback) {
            _onCloseCallback();
        }
    }

    /**
     * Клик на кнопку закрытия
     */
    function _onContinueClick() {
        hide();
        if (_onContinueCallback) {
            _onContinueCallback();
        }
    }

    global.init = init;
    global.setMessages = setMessages;
    global.show = show;
    global.hide = hide;
    global.isShown = isShown;

})(AssistentPopup);