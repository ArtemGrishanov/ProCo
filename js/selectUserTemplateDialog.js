/**
 * Created by artyom.grishanov on 12.03.16.
 *
 * Диалог для выбора ранее сохраненных проектор
 * TODO объединить с универсальным диалогом
 */
function SelectUserTemplateDialog(params) {
    this.selectedOptionId = null;
    this.view = null;

    var html = $('#id-select_dialog_template').html();
    this.view = $(html);
    this.view.find('.js-caption').text('Ваши проекты');
    var optionHtml = $('#id-select_dialog_myproject_template').html();
    var $cnt = this.view.find('.js-options_cnt');
    for (var i = 0; i < params.options.length; i++) {
        var $e = $(optionHtml).click((function(e){
            var $t = $(e.currentTarget);
            this.selectedOptionId = $t.attr('data-id');
            params.callback(this.selectedOptionId);
            $('#id-dialogs_view').empty().hide();
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