/**
 * Created by artyom.grishanov on 18.04.16.
 */
$('#id-user_toolbar').click(function() {
    var e = $('#id-user_ctx_menu');
    if (e.css('display') === 'none') {
        e.show();
    }
    else {
        e.hide();
    }
});