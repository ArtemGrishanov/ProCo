/**
 * Created by alex on 18.01.18.
 */
var SlideEditScreen = MutApp.Screen.extend({
    /**
     * @see MutApp
     */
    type: 'slideEdit',
    /**
     * Тег для группировки экранов в редакторе
     * @see MutApp
     */
    group: 'slideEdit',
    /**
     * Метка которая показывается в редакторе, рядом с превью экрана
     * @see MutApp
     */
    name: {EN:'Slider screen', RU:'Фото галерея'},
    /**
     * Для контрола SlideGroupControl, который управляет порядком группы экранов
     *
     * Это свойство надо понимать так:
     * Порядок этой вот группы экранов questions зависит от этого массива 'id=psm slides'
     */
    arrayAppPropertyString: 'id=psm slides',
    /**
     * Не показывать экран при редактировании
     */
    hideScreen: true,
    collapse: false,
    draggable: false,
    canAdd: true,
    canDelete: true,
    canClone: true,
    /**
     * Контейнер в котором будет происходить рендер этого вью
     * Создается динамически
     */
    el: null,
    /**
     * View маркеры прогресса
     */
    $counters: [],
    /**
     * индекс слайда за который отвечает этот экран
     * этот экран для редактирования показывает только этот слайд и всё
     */
    slideDictionaryId: undefined,
    /**
     * Объект-слайд из модели с которым связан этот экран
     */
    slide: null,

    template: {
        "default": _.template($('#id-slider_template').html()),
        "sliderItem": _.template($('#id-slider_item').html()),
        "counterItem": _.template($('#id-counter_item').html())
    },

    events: {
        // no events here
    },

    initialize: function (param) {
        this.super.initialize.call(this, param);
        this.setElement($('<div></div>')
            .attr('id',this.id)
            .css('width','100%')
            .css('min-height','100%'));
        param.screenRoot.append(this.$el);

        this.slideDictionaryId = param.slideDictionaryId;
//        this.model.bind("change:slides", this.onMutAppPropertyChanged, this);
        this.slide = this.model.get('slides').getValue()[this.slideDictionaryId];
        this.slide.imgSrc.bind('change', this.onMutAppPropertyChanged, this);
    },

    onMutAppPropertyChanged: function() {
        this.render();
    },

    render: function() {
        this.$el.html(this.template['default']());

        // если использовать setTimeout то превью в Slide.js не создается, нужно рендерить синхронно
//        setTimeout((function(){
            this.renderSlides();
//        }).bind(this),0);

        this.$slidesCnt = $('.js-slides_cnt');
        this.renderCompleted();

        return this;
    },

    renderSlides: function() {
        var $slc = this.$el.find('.js-slides_cnt').empty();
        var slides = this.model.get('slides').toArray();
        var slideIndex = this.model.get('slides').getPosition(this.slideDictionaryId);
        var thisSlide = this.model.getSlideInfo(slideIndex);
        var $counterCnt = this.$el.find('.js-slide_counter_cnt').empty();
        this.$counters = [];

        for (var i = 0; i < slides.length; i++) {
            if (slideIndex === i) {
                // рендерим только тот слайд за который отвечает этот экран
                var sl = slides[i];
                var $sliderItem = $(this.template['sliderItem']({
                    img: sl.imgSrc.getValue(),
                    img_thumb: sl.imgSrc.getValue(), //sl.imgThumbSrc, // сразу полную версию картинки
                    display: 'block',
                    slide_index: i,
                    dictionaryId: this.slideDictionaryId,
                }));
                $sliderItem.find('img').removeClass('preview');
                $slc.append($sliderItem);
            }

            var $counterItem = $(this.template['counterItem']({
                active: i === slideIndex ? '__active': '',
                slide_index: i
            }));
            $counterCnt.append($counterItem);
            this.$counters.push($counterItem);
        }

        // текст текущего слайда поставить
        this.$el.find('.js-slide_text').text(thisSlide.text.getValue());
        // числовой индекс слайда обновить
        this.$el.find('.js-slide_num').text((slideIndex+1)+'/'+slides.length);
    },

    destroy: function() {
        this.slide.imgSrc.unbind('change', this.onMutAppPropertyChanged, this);
    }
});