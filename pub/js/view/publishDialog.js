/**
 * Created by artyom.grishanov on 17.04.16.
 * На момент создания тут было два таба в диалоге: таб для прямой ссылки и таб для кода встраивания
 *
 * @param {string} params.embedCode код для встраивания
 * @param {string} params.embedCodeIframe альтернативный код для встраивания с помощью iframe
 * @param {string} params.link ссылка на проект, на анонимку
 * @param {string} params.tabId -
 */
function PublishDialog(params) {
    this.view = $($('#id-publish_dialog_template').html());
    App.localize(this.view);
    if (params && params.link) {
        this.view.find('.js-project_link').val(params.link);
        this.view.find('.js-view').attr('href',params.link);
    }
    if (params && params.embedCode) {
        this.view.find('.js-embed_code').text(params.embedCode);
    }
    if (params && params.embedCodeIframe) {
        this.view.find('.js-embed_code_iframe').text(params.embedCodeIframe);
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

    try {
        var cLink = new Clipboard('.js-copy_link');
        cLink.on('success', function(event) {
            event.clearSelection();
            $(event.trigger).text(App.getText('copied'));
        });
        cLink.on('error', function(event) {

        });
        var cEmbedCode = new Clipboard('.js-copy_embed_code');
        cEmbedCode.on('success', function(event) {
            event.clearSelection();
            $(event.trigger).text(App.getText('copied'));
        });
        cEmbedCode.on('error', function(event) {

        });
    }
    catch(e) {
        console.error(e);
    }
}
