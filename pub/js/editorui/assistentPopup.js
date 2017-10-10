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
    var SUPPORTED_VISUALIZATION_TYPES = ['PieChart'];

    function init(param) {
        param = param || {};
        _onContinueCallback = param.continueCallback;
        _onCloseCallback = param.closeCallback;
        _$messagesCnt = $('#id-assistent_cnt');
        _view = $('#id-assistent');
        _view.hide();
        _view.find('.js-close').click(_onCloseClick.bind(this));
        _view.find('.js-cancel').click(_onCloseClick.bind(this));
        _view.find('.js-continue').click(_onContinueClick.bind(this));
    }

    /**
     * Установить подсказки в диалог
     *
     * @param {Array} data
     */
    function setMessages(data) {
        _$messagesCnt.empty();
        for (var i = 0; i < data.length; i++) {
            var m = data[i];
            // data.type
            // data.html
            // data.message
            // data.visualization
            //todo localization
            if (m.message) {
                $('<p>'+m.message+'</p>').appendTo(_$messagesCnt);
            }
            if (m.html) {
                $('<p></p>').html().appendTo(_$messagesCnt);
            }
            if (m.visualization && m.visualization.type && m.visualization.data) {
                if (SUPPORTED_VISUALIZATION_TYPES.indexOf(m.visualization.type) >= 0) {
                    var data = google.visualization.arrayToDataTable(m.visualization.data);
                    var options = {
                        title: m.visualization.title || ''
                    };
                    var chartid = m.visualization.type+'_'+getUniqId();
                    $('<div id="'+id+'"></div>').html().appendTo(_$messagesCnt);
                    var chart = new google.visualization[m.visualization.type](document.getElementById(chartid));
                    chart.draw(data, options);
                }
                else {
                    throw new Error('AssistentPopup.setMessages: unsupported visualization type \''+ m.visualization.type+'\'');
                }
            }
        }
    }

    /**
     * Показать popup
     *
     * @param {boolean} param.showContinueButton
     */
    function show(param) {
        param = param || {};
        if (param.showContinueButton === true) {
            _view.find('.js-cancel').show();
            _view.find('.js-continue').show();
        }
        else {
            _view.find('.js-cancel').hide();
            _view.find('.js-continue').hide();
        }
        _view.show();
    }

    /**
     * Скрытие
     */
    function hide() {
        _view.hide();
    }

    /**
     * Показана ли панель или нет
     *
     * @returns {boolean}
     */
    function isShown() {
        return _view.css('display') === 'block';
    }

    /**
     * Клик на кнопку закрытия
     */
    function _onCloseClick() {
        this.hide();
        if (_onCloseCallback) {
            _onCloseCallback();
        }
    }

    /**
     * Клик на кнопку закрытия
     */
    function _onContinueClick() {
        this.hide();
        if (_onContinueClick) {
            _onContinueClick();
        }
    }

    global.init = init;
    global.setMessages = setMessages;
    global.show = show;
    global.hide = hide;
    global.isShown = isShown;

})(AssistentPopup);