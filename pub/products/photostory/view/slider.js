/**
 * Created by alex on 18.01.18.
 */
var SliderScreen = MutApp.Screen.extend({
    /**
     * @see MutApp
     */
    id: 'sliderScr',

    /**
     * Тег для группировки экранов в редакторе
     * @see MutApp
     */
    group: 'slider',

    /**
     * Метка которая показывается в редакторе, рядом с превью экрана
     * @see MutApp
     */
    name: {EN:'Slider screen',RU:'Слайдер'},
    /**
     * Контейнер в котором будет происходить рендер этого вью
     * Создается динамически
     */
    el: null,
    /**
     * Хранилище слайдов: img url используется как ключ
     */
    sliderItemsMap: {},
    /**
     *
     */
    slideWidth: undefined,
    touchstartx: undefined,
    touchmovex: undefined,
    movex: undefined,
    /**
     * Определение долгого "уверенного" свайпа, а не легкого короткого
     */
    longTouch: undefined,
    /**
     * ид вызова setTimeout для очистки clearTimeout
     */
    longTouchTimeoutId: undefined,
    /**
     * saved all slider items after render() $('.js-slider_item')
     */
    $sliderItems: undefined,

    template: {
        "default": _.template($('#id-slider_template').html()),
        "sliderItem": _.template($('#id-slider_item').html())
    },

    events: {
        "click .js-next": "onNextClick",
        "click .js-logo": "onLogoClick",
        "touchstart .js-slides_cnt": "onSlidesCntTouchStart",
        "touchmove .js-slides_cnt": "onSlidesCntTouchMove",
        "touchend .js-slides_cnt": "onSlidesCntTouchEnd",
    },

    onSlidesCntTouchStart: function(event) {
        console.log('onSlidesCntTouchStart');
        this.longTouch = false;
        if (this.longTouchTimeoutId) {
            clearTimeout(this.longTouchTimeoutId);
        }
        this.longTouchTimeoutId = setTimeout((function() {
            // определяем долгий "уверенный" тач, исключая случайные касания
            // в нативном исполнении это тоже так: легкие краткие касания не работают
            this.longTouch = true;
            $sliderItems.removeClass('animate');
        }).bind(this), 250);
        this.touchstartx =  event.originalEvent.touches[0].pageX;
        this.slideWidth = $().width();
    },

    onSlidesCntTouchMove: function(event) {
        console.log('onSlidesCntTouchMove');
        this.touchmovex =  event.originalEvent.touches[0].pageX;
        this.movex = this.model.get('slideIndex')*this.slideWidth + (this.touchstartx - this.touchmovex);
        var panx = 100-this.movex/6;
    },

    onSlidesCntTouchEnd: function(event) {
        // Calculate the distance swiped.
        var absMove = Math.abs(this.model.get('slideIndex')*this.slideWidth - this.movex);
        if (absMove > this.slideWidth/2) {
            // запустить смену слайда
            // TODO
        }
    },

    initialize: function (param) {
        this.super.initialize.call(this, param);
        this.setElement($('<div></div>')
            .attr('id',this.id)
            .css('width','100%')
            .css('min-height','100%'));
        param.screenRoot.append(this.$el);

        this.model.bind("change:state", function() {
            if (this.model.get('state') === 'slider') {
                this.model.application.showScreen(this);
                this.render();
            }
        }, this);

        this.model.bind("change:slides", this.onMutAppPropertyChanged, this);
    },

    onMutAppPropertyChanged: function() {
        this.render();
    },

    render: function() {
        this.sliderItemsMap = {};

        this.$el.html(this.template['default']());

        var $slc = this.$el.find('.js-slides_cnt');
        var slides = this.model.get('slides').toArray();
        var slideIndex = this.model.get('slideIndex');

        for (var i = 0; i < slides.length; i++) {
            var sl = slides[i];
            // показываем только текущий слайд, так как изначально трансформ не стоит
            var display = (slideIndex === i) ? 'block': 'none';
//            var display = 'block';
            var $sliderItem = $(this.template['sliderItem']({
                img: sl.imgSrc,
                display: display
            }));
//            var transform = 'translate3d(0,0,0)';
//            if (slideIndex > i) {
//                transform = 'translate3d(-417px,0,0)';
//            }
//            else if (slideIndex < i) {
//                transform = 'translate3d(417px,0,0)';
//            }
//            $sliderItem.css('transform', transform);
            // сохраняем все вью в мапу
            this.sliderItemsMap[sl.imgSrc] = $sliderItem;
            $slc.append($sliderItem);
        }

        this.$sliderItems = $('js-slider_item');
        this.renderCompleted();
        return this;
    },

    /**
     * Прокрутить слайд на следующий
     */
    nextSlide: function() {
        var slideIndex = this.model.get('slideIndex');
        var slide = this.model.getSlideInfo(slideIndex);

        var nextIndex = this.model.getNextSlideIndex();
        var nextSlide = this.model.getSlideInfo(nextIndex);

        var $nextSlideView = $(this.sliderItemsMap[nextSlide.imgSrc]);
        var $slideView = $(this.sliderItemsMap[slide.imgSrc]);

        // определить длину перемещения, ведь ширина айфрейма может и измениться
        var movex = $slideView.width();
        $nextSlideView.show()
            .removeClass('animate')
            .css('transform', 'translate3d(' + movex + 'px,0,0)');
        this.model.nextSlide();

        setTimeout(function() {
            $slideView.addClass('animate')
                .css('transform','translate3d(-' + movex + 'px,0,0)');
            $nextSlideView.addClass('animate')
                .css('transform','translate3d(0,0,0)');
        }, 0);

    },

    /**
     * Прокрутить слайд на предыдущий
     */
    prevSlide: function() {
        var slideIndex = this.model.get('slideIndex');
        var slide = this.model.getSlideInfo(slideIndex);

        var prevIndex = this.model.getPrevSlideIndex();
        var prevSlide = this.model.getSlideInfo(prevIndex);

        var $prevSlideView = $(this.sliderItemsMap[prevSlide.imgSrc]);
        var $slideView = $(this.sliderItemsMap[slide.imgSrc]);

        // определить длину перемещения, ведь ширина айфрейма может и измениться
        var movex = $slideView.width();
        $prevSlideView.show()
            .removeClass('animate')
            .css('transform', 'translate3d(-' + movex + 'px,0,0)');
        this.model.prevSlide();

        setTimeout(function() {
            $slideView.addClass('animate')
                .css('transform','translate3d(' + movex + 'px,0,0)');
            $prevSlideView.addClass('animate')
                .css('transform','translate3d(0,0,0)');
        }, 0);
    }
});