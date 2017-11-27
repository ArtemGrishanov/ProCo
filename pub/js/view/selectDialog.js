/**
 * Created by artyom.grishanov on 12.03.16.
 *
 * Универсальный диалог для выбора чего-то
 * Например, используется для выбор какой вопрос в тест добавить (их несколько видов)
 * или для выбора картинки
 *
 * @param params
 * @param {string} params.caption - заголовок леера
 * @param {string} params.showLoader - показывать ли лоадер пока не установлены опции
 * @param {Array.<object>} params.options - {icon, label, id, htmlElement, selectable} список вариантов для выбора.
 * @param {function} params.callback - вызывается, когда выбор сделан. Передается либо id выбранного итема, либо null если пользователь просто закрыл диалог
 */
function SelectDialog(params) {
    this.selectedOptionId = null;
    this.view = null;
    this.loader = null;
    this.cnt = null;
    /**
     * Установить опции для выбора
     * Можно установить в любой момент, прежние опции удалятся
     * @param {Array.<object>} params.options - {icon, label, id, htmlElement, selectable} список вариантов для выбора.
     */
    this.setOptions = function(options) {
        var optionHtml = $('#id-select_dialog_option_template').html();
        var $cnt = this.cnt.empty();
        if (options) {
            $(this.loader).hide();
            $(this.cnt).show();
            for (var i = 0; i < options.length; i++) {
                // htmlElement - это когда уже указано что вставлять в элемент выбора, готовый html элемент
                //    например кнопка "Загрузить" в списке картинок явно отличается от них
                // optionHtml - стандартный шаблн
                var t = (options[i].htmlElement) ? options[i].htmlElement : optionHtml;
                var $e = $(t);
                // если опция помечана как selectable=false, то не надо ее выделить кликом
                if (!(options[i].hasOwnProperty('selectable') && options[i].selectable === false)) {
                    $e.click((function(e) {
                        $('.js-option').removeClass('__active');
                        // оборачиваем элемент по которому кликнули
                        var $t = $(e.currentTarget);
                        $t.addClass('__active');
                        this.selectedOptionId = $t.attr('data-id');
                    }).bind(this));
                }
                $e.attr('data-id',options[i].id).find('.js-option_label').text(
                    (typeof options[i].label === 'string') ? options[i].label: options[i].label[App.getLang()]
                );
                if (options[i].icon) {
                    $e.find('.js-option_icon').css('backgroundImage','url("'+options[i].icon+'")');
                }
                $cnt.append($e);
            }
        }
        else {
            if (params.showLoader === true) {
                $(this.loader).show();
                $(this.cnt).hide();
            }
            else {
                $(this.loader).hide();
                $(this.cnt).show();
            }
        }
    };

    // init section
    var html = $('#id-select_dialog_template').html();
    this.view = $(html);
    $('#id-dialogs_view').css('z-index',config.editor.ui.selectDialogZIndex); // у самого контейнера тоже надо ставить, потом вернется значение при закрытии (см ниже)
    this.view.css('z-index',config.editor.ui.selectDialogZIndex);
    App.localize(this.view);
    this.loader = this.view.find('.js-loader');
    this.cnt = this.view.find('.js-options_cnt');
    this.view.find('.js-caption').text(params.caption);
    this.view.find('.js-confirm').click((function(e) {
        params.callback(this.selectedOptionId);
        $('#id-dialogs_view').css('zIndex', '0'); // из-за хака в previewShareImageModal (два диалога поверх друг друга)
        $('#id-dialogs_view').empty().hide();
    }).bind(this));
    this.view.find('.js-cancel').click((function(e) {
        params.callback(null);
        $('#id-dialogs_view').css('zIndex', '0'); // из-за хака в previewShareImageModal (два диалога поверх друг друга)
        $('#id-dialogs_view').empty().hide();
    }).bind(this));
    if (params.options) {
        this.setOptions(params.options);
    }
    else {
        if (params.showLoader === true) {
            $(this.loader).show();
            $(this.cnt).hide();
        }
        else {
            $(this.loader).hide();
            $(this.cnt).show();
        }
    }
}