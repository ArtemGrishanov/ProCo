/**
 * Created by artyom.grishanov on 01.03.18.
 */

$('.js-pricing_rb').click(function(e){
    var $e = $(e.currentTarget);
    var key = $e.attr('data-price-pts-key');
    $('.js-basic_tariff_price').html(App.getText(key));
});