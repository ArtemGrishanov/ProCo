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
     * полные загруженные Image объекты хранятся в мапе
     * для повторного использования, например рендера
     */
    fullImagesMap: {},
    /**
     *
     */
    slideWidth: undefined,
    /**
     * .js-slides_cnt
     */
    $slidesCnt: undefined,
    touchstartx: undefined,
    touchstarty: undefined,
    touchmovex: undefined,
    touchmovey: undefined,
    movex: undefined,
    movey: undefined,
    /**
     *
     */
    slideCntTranslateX: 0,
    /**
     * Определение долгого "уверенного" свайпа, а не легкого короткого
     */
    longTouch: undefined,
    /**
     * Признак вертикального свайпа
     */
    verticalSwipe: false,
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
    /**
     * Признак того что слайдер находится в правом крайнем положении (в конце)
     */
    isRightEdge: false,
    /**
     * Признак того что слайдер находится в левом крайнем положении (в начале)
     */
    isLeftEdge: false,

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
        this.verticalSwipe = false;
        if (this.longTouchTimeoutId) {
            clearTimeout(this.longTouchTimeoutId);
        }
        this.longTouchTimeoutId = setTimeout((function() {
            // определяем долгий "уверенный" тач, исключая случайные касания
            // в нативном исполнении это тоже так: легкие краткие касания не работают
            this.longTouch = true;
            // здесь мы решаем начинать или нет горизонтальный скрол
            // является ли свайп вертикальным или горизонтальным
            if (Math.abs(this.touchmovey - this.touchstarty) > Math.abs(this.touchmovex - this.touchstartx)) {
                this.verticalSwipe = true;
                console.log('onSlidesCntTouchStart: Vertical swipe detected');
            }
            this.longTouchTimeoutId = null;
        }).bind(this), 10);

        // ширину слайда при первом таче определяем
        this.slideWidth = this.$slidesCnt.width();
        this.$slidesCnt.removeClass('animate');
        // this.touchSlideIndex = this.model.get('slideIndex');
        //Важный момент: выбрал вычисление индекса при начале перетаскивания не по модели а по положению контейнера
        //так как бывает рассинхрон
        this.touchSlideIndex = Math.round(-this.slideCntTranslateX / this.slideWidth);
        this.isRightEdge = this.touchSlideIndex >= this.model.get('slides').toArray().length-1;
        this.isLeftEdge = this.touchSlideIndex <= 0

        this.touchstartx =  event.originalEvent.touches[0].pageX;
        this.touchstarty =  event.originalEvent.touches[0].pageY;
    },

    onSlidesCntTouchMove: function(event) {
        this.touchmovex =  event.originalEvent.touches[0].pageX;
        this.touchmovey =  event.originalEvent.touches[0].pageY;
        if (this.longTouch === true) {
            if (this.verticalSwipe === false) {
                this.movex = -this.touchSlideIndex*this.slideWidth + (this.touchmovex - this.touchstartx);

                var edgeWidth = this.slideWidth / 6;
                if (this.isLeftEdge === true && this.movex > edgeWidth) {
                    this.movex = edgeWidth;
                }
                if (this.isRightEdge === true && this.movex < (-this.touchSlideIndex*this.slideWidth-edgeWidth)) {
                    this.movex = -this.touchSlideIndex*this.slideWidth-edgeWidth;
                }
                this.$slidesCnt.css('transform','translate3d(' + this.movex + 'px,0,0)');

                // для горизонтального свайпа запретить поведение по умолчанию: прокрутку страницы вертикально
                event.originalEvent.preventDefault();
                event.originalEvent.stopPropagation();
                event.originalEvent.stopImmediatePropagation();
                console.log('onSlidesCntTouchMove: preventDefault');
            }
            else {
                // vertical page scrolling enabled
                console.log('onSlidesCntTouchMove: return true');
                return true;
            }
        }
        else {
            // по дефолту запрещаем пока не понято что это вертикальный свайп
            // TODO iOS Safari: но раз запретив потом разрешение уже не работает
            // event.originalEvent.preventDefault();
            // console.log('onSlidesCntTouchMove: not loung touch preventDefault');

            // TODO если здесь в этом else ничего не писать: значит по умолчанию вертикальный свайп разрешен
            // это значит при быстром движении пальцами он уже будет начат когда определится this.verticalSwipe
            // и будет одновременно и горизонтальная прокрутка и вертикальная
        }
    },

    onSlidesCntTouchEnd: function(event) {
        console.log('onSlidesCntTouchEnd. movex='+this.movex);
        // дистанция на которую надо сделать тач, чтобы начался переход к другому слайду
        var distanceToChange = this.slideWidth / 6;
        if ((this.touchstartx - this.touchmovex) > distanceToChange) {
            // переход вправо, movex отрицительный
            this.model.setSlideIndex(this.touchSlideIndex+1);
        }
        else if (-(this.touchstartx - this.touchmovex) > distanceToChange) {
            // переход влево
            this.model.setSlideIndex(this.touchSlideIndex-1);
        }
        else {
            // вернуть в исходное состояние

        }
        var si = this.model.get('slideIndex');
        this.slideCntTranslateX = (-si*this.slideWidth);
        this.$slidesCnt.addClass('animate');
        this.$slidesCnt.css('transform','translate3d(' + this.slideCntTranslateX + 'px,0,0)');
    },

    initialize: function (param) {
        this.super.initialize.call(this, param);
        this.setElement($('<div></div>')
            .attr('id',this.id)
            .css('width','100%')
            .css('min-height','100%'));
        param.screenRoot.append(this.$el);

        this.fullImagesMap = {};

        if (window.addEventListener) {
            // listener on changing window size to measure slide width
            window.addEventListener('resize', this.onWindowResize.bind(this), false);
        }

        this.model.bind("change:state", function() {
            if (this.model.get('state') === 'slider') {
                this.model.application.showScreen(this);
                this.render();
            }
        }, this);

        this.model.bind("change:slides", this.onMutAppPropertyChanged, this);

        if (window.addEventListener && window.requestAnimationFrame && document.getElementsByClassName) {
            window.addEventListener('load', this.onWindowLoaded.bind(this));
        }
    },

    /**
     *
     */
    onWindowLoaded: function() {
        console.log('onWindowLoaded');
        var items = document.getElementsByClassName('progressive replace');
        for (var i = 0; i < items.length; i++) {
            this.loadFullImage(items[i]);
        }
    },

    /**
     * Replace with full image
     *
     * By https://www.sitepoint.com/how-to-build-your-own-progressive-image-loader/
     *
     * @param item
     */
    loadFullImage: function(item) {
        if (!item || !item.attributes['data-img-src']) return;
        // load image
        var img = new Image();
        if (item.dataset) {
            img.srcset = item.dataset.srcset || '';
            img.sizes = item.dataset.sizes || '';
        }
        img.src = item.attributes['data-img-src'].value;
        // сохраняем картинку для повторного использования при дальнейших рендерах
        this.fullImagesMap[img.src] = img;
        img.className = 'slider_img';
        if (img.complete) {
            addImg();
        }
        else {
            img.onload = addImg;
        }
        // replace image
        function addImg() {
            // add full image
            item.appendChild(img);
                // remove preview image
            var pImg = item.querySelector && item.querySelector('img.preview');
            if (pImg) {
                item.removeChild(pImg);
            }
        }
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
        var $slc = this.$slidesCnt.empty();
        var slides = this.model.get('slides').toArray();
        var slideIndex = this.model.get('slideIndex');

        for (var i = 0; i < slides.length; i++) {
            var sl = slides[i];

            var $sliderItem = $(this.template['sliderItem']({
                img: sl.imgSrc,
                img_thumb: sl.imgThumbSrc,
                display: 'block',
                slide_index: i
            }));

            if (this.fullImagesMap[sl.imgSrc]) {
                // для этой картинки уже создан объект Image
                // Возможно, даже загружен полностью, надо использовать его
                $sliderItem.find('img').remove();
                $sliderItem.append(this.fullImagesMap[sl.imgSrc]);
            }
            else {

            }

            var transform = 'translate3d('+(i*this.slideWidth)+'px,0,0)';
            $sliderItem.css('transform', transform);
            // сохраняем все вью в мапу
            this.sliderItemsMap[sl.imgSrc] = $sliderItem;
            $slc.append($sliderItem);
        }

        this.slideCntTranslateX = (-slideIndex*this.slideWidth);
        this.$slidesCnt.css('transform','translate3d(' + this.slideCntTranslateX + 'px,0,0)');
        this.$sliderItems = $('js-slider_item');
    }
});