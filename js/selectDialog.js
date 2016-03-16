/**
 * Created by artyom.grishanov on 12.03.16.
 *
 * Универсальный диалог для выбора чего-то
 * Например, используется для выбор какой вопрос в тест добавить (их несколько видов)
 *
 * @param params
 * @param {string} params.caption - заголовок леера
 * @param {Array.<object>} params.options - {icon, label, id} список вариантов для выбора.
 * @param {function} params.callback - вызывается, когда выбор сделан. Передается либо id выбранного итема, либо null если пользователь просто закрыл диалог
 */
function SelectDialog(params) {
    this.selectedOptionId = null;
    this.view = null;

    var html = $('#id-select_dialog_template').html();
    this.view = $(html);
    this.view.find('.js-caption').text(params.caption);
    var optionHtml = $('#id-select_dialog_option_template').html();
    var $cnt = this.view.find('.js-options_cnt');
    for (var i = 0; i < params.options.length; i++) {
        var $e = $(optionHtml).click((function(e){
            $('.js-option').removeClass('__active');
            // оборачиваем элемент по которому кликнули
            var $t = $(e.currentTarget);
            $t.addClass('__active');
            this.selectedOptionId = $t.attr('data-id');
        }).bind(this));
        $e.attr('data-id',params.options[i].id).find('.js-option_label').text(params.options[i].label);
        $cnt.append($e);
    }

    this.view.find('.js-confirm').click((function(e) {
        params.callback(this.selectedOptionId);
        $('#id-dialogs_view').empty().hide();
    }).bind(this));
    this.view.find('.js-cancel').click((function(e) {
        params.callback(null);
        $('#id-dialogs_view').empty().hide();
    }).bind(this));
}