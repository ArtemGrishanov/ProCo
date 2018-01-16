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
    /**
     * .js-slides_cnt
     */
    $slidesCnt: undefined,
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

    touchSlideIndex: undefined,
    touchSlide: undefined,

    isRightEdge: false,
    isLeftEdge: false,
//    $touchSlideView: undefined,

    touchPrevIndex: undefined,
    touchPrevSlide: undefined,
//    $touchPrevSlideView: undefined,
    touchPrevSlideStartX: undefined,

    touchNextIndex: undefined,
    touchNextSlide: undefined,
//    $touchNextSlideView: undefined,
    touchNextSlideStartX: undefined,

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
//        if (this.longTouchTimeoutId) {
//            clearTimeout(this.longTouchTimeoutId);
//        }
//        this.longTouchTimeoutId = setTimeout((function() {
            // определяем долгий "уверенный" тач, исключая случайные касания
            // в нативном исполнении это тоже так: легкие краткие касания не работают
            this.longTouch = true;
//            this.$sliderItems.removeClass('animate');
            this.$slidesCnt.removeClass('animate');

        this.touchSlideIndex = this.model.get('slideIndex');
            this.isRightEdge = this.touchSlideIndex >= this.model.get('slides').toArray().length-1;
        this.isLeftEdge = this.touchSlideIndex <= 0
//            this.touchSlide = this.model.getSlideInfo(this.touchSlideIndex);
//            this.$touchSlideView = $(this.sliderItemsMap[this.touchSlide.imgSrc]).show();
            // ширину слайда при первом таче определяем
            this.slideWidth = this.$slidesCnt.width();

//            this.touchPrevIndex = this.model.getPrevSlideIndex();
//            this.touchPrevSlide = this.model.getSlideInfo(this.touchPrevIndex);
//            this.$touchPrevSlideView = $(this.sliderItemsMap[this.touchPrevSlide.imgSrc]).show();
//            this.touchPrevSlideStartX = -this.slideWidth;
//            this.$touchPrevSlideView.css('transform', 'translate3d(' + this.touchPrevSlideStartX + 'px,0,0)'); // переносим слайд слева за видимой частью экрана
//
//            this.touchNextIndex = this.model.getNextSlideIndex();
//            this.touchNextSlide = this.model.getSlideInfo(this.touchNextIndex);
//            this.$touchNextSlideView = $(this.sliderItemsMap[this.touchNextSlide.imgSrc]).show();
//            this.touchNextSlideStartX = this.slideWidth;
//            this.$touchNextSlideView.css('transform', 'translate3d(' + this.touchNextSlideStartX + 'px,0,0)'); // переносим слайд справа за видимой частью экрана

//        }).bind(this), 150);
        this.touchstartx =  event.originalEvent.touches[0].pageX;
    },

    onSlidesCntTouchMove: function(event) {
        this.touchmovex =  event.originalEvent.touches[0].pageX;
        if (this.longTouch === true) {
            this.movex = -this.touchSlideIndex*this.slideWidth + (this.touchmovex - this.touchstartx);

            var edgeWidth = this.slideWidth / 6;
            if (this.isLeftEdge === true && this.movex > edgeWidth) {
                this.movex = edgeWidth;
            }
            if (this.isRightEdge === true && this.movex < (-this.touchSlideIndex*this.slideWidth-edgeWidth)) {
                this.movex = -this.touchSlideIndex*this.slideWidth-edgeWidth;
            }
            this.$slidesCnt.css('transform','translate3d(' + this.movex + 'px,0,0)');
        }
        console.log('onSlidesCntTouchMove: '+this.movex);
    },

    onSlidesCntTouchEnd: function(event) {
        console.log('onSlidesCntTouchEnd. movex='+this.movex);
        // дистанция на которую надо сделать тач, чтобы начался переход к другому слайду
        var distanceToChange = this.slideWidth / 6;
        if ((this.touchstartx - this.touchmovex) > distanceToChange) {
            // переход вправо, movex отрицительный
            //this.nextSlide();
            this.model.nextSlide();
        }
        else if (-(this.touchstartx - this.touchmovex) > distanceToChange) {
            // переход влево
            //this.prevSlide();
            this.model.prevSlide();
        }
        else {
            // вернуть в исходное состояние

        }
        var si = this.model.get('slideIndex');
        this.$slidesCnt.addClass('animate');
        this.$slidesCnt.css('transform','translate3d(' + (-si*this.slideWidth) + 'px,0,0)');
    },

    initialize: function (param) {
        this.super.initialize.call(this, param);
        this.setElement($('<div></div>')
            .attr('id',this.id)
            .css('width','100%')
            .css('min-height','100%'));
        param.screenRoot.append(this.$el);

        // listener on changing window size to measure slide width
        // TODO add listener, not override this function
        window.onresize = this.onWindowResize.bind(this);

        this.model.bind("change:state", function() {
            if (this.model.get('state') === 'slider') {
                this.model.application.showScreen(this);
                this.render();
            }
        }, this);

        this.model.bind("change:slides", this.onMutAppPropertyChanged, this);
    },

    /**
     * При изменении размера окна
     * размер контейнера для слайдов скорее всего тоже изменится.
     * Нужно пересчитать
     */
    onWindowResize: function() {
        setTimeout((function(){
            this.slideWidth = this.$slidesCnt.width();
            this.renderSlides();
        }).bind(this),0);
    },

    onMutAppPropertyChanged: function() {
        this.render();
    },

    //TODO в http://photoswipe.com/ идет подмена картинок, то есть после прокрутки три новые (ближайшие) становятся в слайдер, остальные удаляются
    render: function() {
        this.sliderItemsMap = {};

        this.$el.html(this.template['default']());

        setTimeout((function(){
            this.slideWidth = this.$slidesCnt.width();
            this.renderSlides();
        }).bind(this),0);

        this.$slidesCnt = $('.js-slides_cnt');
        this.renderCompleted();
        return this;
    },

    /**
     * 1) Чтобы отрендерить сладйды нам надо сначала знать slideWidth
     * 2) Рендерить все слайды не надо
     * 3) Слайды в одном контейнере и смещены все трансформом (а не position left)
     * 4) Далее двигаться будет контейнер трансформом, а не слайды
     */
    renderSlides: function() {
        var $slc = this.$el.find('.js-slides_cnt').empty();
        var slides = this.model.get('slides').toArray();
        var slideIndex = this.model.get('slideIndex');

        for (var i = 0; i < slides.length; i++) {
            var sl = slides[i];
            // показываем только текущий слайд, так как изначально трансформ не стоит
//            var display = (slideIndex === i) ? 'block': 'none';
            var display = 'block';
            var $sliderItem = $(this.template['sliderItem']({
                img: sl.imgSrc,
                display: display
            }));
            var trNumber = (i-slideIndex)*this.slideWidth;
            var transform = 'translate3d('+trNumber+'px,0,0)';
            $sliderItem.css('transform', transform);
            // сохраняем все вью в мапу
            this.sliderItemsMap[sl.imgSrc] = $sliderItem;
            $slc.append($sliderItem);
        }

        this.$sliderItems = $('js-slider_item');
    },

    /**
     * Прокрутить слайд на следующий
     */
    nextSlide: function() {

        this.model.nextSlide();
        var si = this.model.get('slideIndex');
        this.$slidesCnt.addClass('animate');
        this.$slidesCnt.css('transform','translate3d(' + (-si*this.slideWidth) + 'px,0,0)');

//        var slideIndex = this.model.get('slideIndex');
//        var slide = this.model.getSlideInfo(slideIndex);
//
//        var nextIndex = this.model.getNextSlideIndex();
//        var nextSlide = this.model.getSlideInfo(nextIndex);
//
//        var $nextSlideView = $(this.sliderItemsMap[nextSlide.imgSrc]);
//        var $slideView = $(this.sliderItemsMap[slide.imgSrc]);
//
//        // определить длину перемещения, ведь ширина айфрейма может и измениться
//        var movex = $slideView.width();
//        $nextSlideView.show()
//            .removeClass('animate')
//            .css('transform', 'translate3d(' + movex + 'px,0,0)');
//        this.model.nextSlide();
//
//        setTimeout(function() {
//            $slideView.addClass('animate')
//                .css('transform','translate3d(-' + movex + 'px,0,0)');
//            $nextSlideView.addClass('animate')
//                .css('transform','translate3d(0,0,0)');
//        }, 0);

    },

    /**
     * Прокрутить слайд на предыдущий
     */
    prevSlide: function() {

        this.model.prevSlide();
        var si = this.model.get('slideIndex');
        this.$slidesCnt.addClass('animate');
        this.$slidesCnt.css('transform','translate3d(' + (-si*this.slideWidth) + 'px,0,0)');

//        var slideIndex = this.model.get('slideIndex');
//        var slide = this.model.getSlideInfo(slideIndex);
//
//        var prevIndex = this.model.getPrevSlideIndex();
//        var prevSlide = this.model.getSlideInfo(prevIndex);
//
//        var $prevSlideView = $(this.sliderItemsMap[prevSlide.imgSrc]);
//        var $slideView = $(this.sliderItemsMap[slide.imgSrc]);
//
//        // определить длину перемещения, ведь ширина айфрейма может и измениться
//        var movex = $slideView.width();
//        $prevSlideView.show()
//            .removeClass('animate')
//            .css('transform', 'translate3d(-' + movex + 'px,0,0)');
//        this.model.prevSlide();
//
//        setTimeout(function() {
//            $slideView.addClass('animate')
//                .css('transform','translate3d(' + movex + 'px,0,0)');
//            $prevSlideView.addClass('animate')
//                .css('transform','translate3d(0,0,0)');
//        }, 0);
    }
});