/**
 * Created by artyom.grishanov on 01.03.18.
 */

$('.js-pricing_rb_basic').click(function(e){
    var $e = $(e.currentTarget);
    var key = $e.attr('data-price-pts-key');
    $('.js-basic_tariff_price').html(App.getText(key));
});

$('.js-pricing_rb_business').click(function(e){
    var $e = $(e.currentTarget);
    var key = $e.attr('data-price-pts-key');
    $('.js-business_tariff_price').html(App.getText(key));
});

$('.js-pricing_rb_enterprise').click(function(e){
    var $e = $(e.currentTarget);
    var key = $e.attr('data-price-pts-key');
    $('.js-enterprise_tariff_price').html(App.getText(key));
});