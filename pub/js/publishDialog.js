/**
 * Created by artyom.grishanov on 17.04.16.
 * На момент создания тут было два таба в диалоге: таб для прямой ссылки и таб для кода встраивания
 *
 * @param {string} params.embedCode код для встраивания
 * @param {string} params.link
 * @param {string} params.tabId -
 */
function PublishDialog(params) {
    this.view = $($('#id-publish_dialog_template').html());
    if (params && params.link) {
        this.view.find('.js-project_link').val(params.link);
        this.view.find('.js-view').attr('href',params.link);
    }
    if (params && params.embedCode) {
        this.view.find('.js-embed_code').text(params.embedCode);
    }

    this.showTab = function(tabId) {
        this.view.find('.js-tab_btn').removeClass('__selected');
        this.view.find('.js-tab_btns').find('[data-tab-id='+tabId+']').addClass('__selected');
        this.view.find('.js-tab').hide();
        this.view.find('.js-tabs').find('[data-tab-id='+tabId+']').show();
    };

    this.view.find('.js-tab_btn').click((function(e){
        var tabId = $(e.currentTarget).attr('data-tab-id');
        this.showTab(tabId);
    }).bind(this));

    this.view.find('.js-close').click((function(e) {
        $('#id-dialogs_view').empty().hide();
    }).bind(this));

    this.view.find('.js-copy_link').click((function(e) {

    }).bind(this));

    this.view.find('.js-copy_embed_link').click((function(e) {

    }).bind(this));

    var ti = (params && params.tabId) || '1';
    this.showTab(ti);
}
