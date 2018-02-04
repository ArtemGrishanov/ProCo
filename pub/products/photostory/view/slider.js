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
     * Не показывать экран при редактировании
     */
    hideScreen: true,
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
    /**
     * View маркеры прогресса
     */
    $counters: [],
    /**
     * Флаг что запрошены загрузка полных картинок
     * Ее запрос может случиться при разных условиях (см по коду)
     * но сделать это надо единожды
     */
    fullImageLoadingRequested: false,
    /**
     * Признак "нажатости" кнопки мыши либо тача
     */
    pressed: false,

    template: {
        "default": _.template($('#id-slider_template').html()),
        "sliderItem": _.template($('#id-slider_item').html()),
        "counterItem": _.template($('#id-counter_item').html())
    },

    events: {
        "click .js-next": "onNextClick",
        "click .js-logo": "onLogoClick",
        "click .js-slider_to_left": "toLeftClick",
        "click .js-slider_to_right": "toRightClick",
        "touchstart .js-slides_cnt": "onSlidesCntTouchStart",
        "touchmove .js-slides_cnt": "onSlidesCntTouchMove",
        "touchend .js-slides_cnt": "onSlidesCntTouchEnd",
        "mousedown .js-slides_cnt": "onMouseDown",
        "mousemove .js-slides_cnt": "onMouseMove",
        "mouseup .js-slides_cnt": "onMouseUp",
        "mouseleave .js-slides_cnt": "onMouseLeave"
    },

    toLeftClick: function() {
        var slideIndex = this.model.get('slideIndex');
        this.model.setSlideIndex(slideIndex-1);
    },

    toRightClick: function() {
        var slideIndex = this.model.get('slideIndex');
        this.model.setSlideIndex(slideIndex+1);

        // ширину слайда при первом таче определяем
        this.slideWidth = this.$slidesCnt.width();
        //Важный момент: выбрал вычисление индекса при начале перетаскивания не по модели а по положению контейнера
        //так как бывает рассинхрон
        this.touchSlideIndex = Math.round(-this.slideCntTranslateX / this.slideWidth);
        this.isRightEdge = this.touchSlideIndex >= this.model.get('slides').toArray().length-1;
        this.isLeftEdge = this.touchSlideIndex <= 0
        if (this.isRightEdge === true) {
            // предварительно показать/подготовить вью экрана с результатами
            this.model.application.result.move({
                animation: true,
                action: 'show'
            });
            this.move({
                animation: true,
                action: 'hide'
            });
        }
        else {
            var si = this.model.get('slideIndex');
            this.slideCntTranslateX = (-si*this.slideWidth);
            this.$slidesCnt.addClass('animate');
            this.$slidesCnt.css('transform','translate3d(' + this.slideCntTranslateX + 'px,0,0)');
        }

    },

    onMouseDown: function(event) {
        this.onSlidesCntTouchStart(event);
    },

    onMouseMove: function(event) {
        this.onSlidesCntTouchMove(event);
    },

    onMouseUp: function(event) {
        this.onSlidesCntTouchEnd(event);
    },

    onMouseLeave: function(event) {
        console.log('mouseleave');
        this.onSlidesCntTouchEnd(event);
    },

    onSlidesCntTouchStart: function(event) {
        console.log('onSlidesCntTouchStart');
        this.longTouch = false;
        this.verticalSwipe = false;
        this.movex = 0;
        if (this.longTouchTimeoutId) {
            clearTimeout(this.longTouchTimeoutId);
        }
        this.longTouchTimeoutId = setTimeout((function() {
            if (this.pressed === true) {
                // определяем долгий "уверенный" тач, исключая случайные касания
                // в нативном исполнении это тоже так: легкие краткие касания не работают
                this.longTouch = true;
                // здесь мы решаем начинать или нет горизонтальный скрол
                // является ли свайп вертикальным или горизонтальным
                if (Math.abs(this.touchmovey - this.touchstarty) > Math.abs(this.touchmovex - this.touchstartx)) {
                    this.verticalSwipe = true;
                    //console.log('onSlidesCntTouchStart: Vertical swipe detected');
                }
            }
            this.longTouchTimeoutId = null;
        }).bind(this), 10
            // для десктопа когда перетаскиваем мышкой задержка гораздо больше
            //(this.model.application.isMobile() === true) ? 10: 200
        );

        // ширину слайда при первом таче определяем
        this.slideWidth = this.$slidesCnt.width();
        this.$slidesCnt.removeClass('animate');
        // this.touchSlideIndex = this.model.get('slideIndex');
        //Важный момент: выбрал вычисление индекса при начале перетаскивания не по модели а по положению контейнера
        //так как бывает рассинхрон
        this.touchSlideIndex = Math.round(-this.slideCntTranslateX / this.slideWidth);
        this.isRightEdge = this.touchSlideIndex >= this.model.get('slides').toArray().length-1;
        this.isLeftEdge = this.touchSlideIndex <= 0
        if (this.isRightEdge === true) {
            // предварительно показать/подготовить вью экрана с результатами
            this.model.application.result.move({
                animation: false,
                action: 'hide'
            });
            this.$el.removeClass('animate');
        }

        this.touchstartx = (event.originalEvent.touches) ? event.originalEvent.touches[0].pageX: event.originalEvent.clientX;
        this.touchstarty = (event.originalEvent.touches) ? event.originalEvent.touches[0].pageY: event.originalEvent.clientY;

        this.pressed = true;
    },

    onSlidesCntTouchMove: function(event) {
        this.touchmovex = (event.originalEvent.touches) ? event.originalEvent.touches[0].pageX: event.originalEvent.clientX;
        this.touchmovey = (event.originalEvent.touches) ? event.originalEvent.touches[0].pageY: event.originalEvent.clientY;
        if (this.longTouch === true) {
            if (this.verticalSwipe === false) {
                this.movex = -this.touchSlideIndex*this.slideWidth + (this.touchmovex - this.touchstartx);

                var edgeWidth = this.slideWidth / 6;
                if (this.isLeftEdge === true && this.movex > edgeWidth) {
                    this.movex = edgeWidth;
                }
                if (this.isRightEdge === true && this.touchstartx-this.touchmovex > 0) {
                    // с правого края начинает постепенно выезжать экран результата
                    this.model.application.result.$el.css('transform','translate3d(' + ((this.touchmovex-this.touchstartx)+this.slideWidth) + 'px,0,0)');
                    this.$el.css('position','absolute').css('transform','translate3d(' + (this.touchmovex-this.touchstartx) + 'px,0,0)');

                    //if (this.movex < (-this.touchSlideIndex*this.slideWidth-edgeWidth)) {
                        // перемещение справа большое: раньше этот код блокировал дальнейшее перемещение вправо
                        //this.movex = -this.touchSlideIndex*this.slideWidth-edgeWidth;
                    //}
                }
                else {
                    // обычное листание
                    this.$slidesCnt.css('transform','translate3d(' + this.movex + 'px,0,0)');
                }

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
            console.log('onSlidesCntTouchMove: not long touch preventDefault');

            // TODO если здесь в этом else ничего не писать: значит по умолчанию вертикальный свайп разрешен
            // это значит при быстром движении пальцами он уже будет начат когда определится this.verticalSwipe
            // и будет одновременно и горизонтальная прокрутка и вертикальная
        }
    },

    onSlidesCntTouchEnd: function(event) {
        console.log('onSlidesCntTouchEnd. movex='+this.movex);
        // дистанция на которую надо сделать тач, чтобы начался переход к другому слайду
        this.longTouch = false;
        if (this.pressed === true) {
            var distanceToChange = this.slideWidth / 6;
            if ((this.touchstartx - this.touchmovex) > distanceToChange) {
                if (this.isRightEdge === true) {
                    // окончательный переход к экрану результата
                    this.model.application.result.move({
                        action: 'show'
                    });
                    this.move({
                        action: 'hide'
                    });
                    this.model.set({
                        state: 'result'
                    });
                }
                else {
                    // переход вправо, movex отрицительный
                    this.model.setSlideIndex(this.touchSlideIndex+1);
                }
            }
            else if (-(this.touchstartx - this.touchmovex) > distanceToChange) {
                // переход влево
                this.model.setSlideIndex(this.touchSlideIndex-1);
            }
            else {
                // вернуть в исходное состояние
                if (this.isRightEdge === true) {
                    this.model.application.result.move({
                        action: 'hide'
                    });
                    this.move({
                        action: 'show'
                    });
                }
            }
            var si = this.model.get('slideIndex');
            this.slideCntTranslateX = (-si*this.slideWidth);
            this.$slidesCnt.addClass('animate');
            this.$slidesCnt.css('transform','translate3d(' + this.slideCntTranslateX + 'px,0,0)');
            this.pressed = false;
        }
    },

    initialize: function (param) {
        this.super.initialize.call(this, param);
        this.setElement($('<div></div>')
            .attr('id',this.id)
            .css('width','100%')
            .css('min-height','100%'));
        param.screenRoot.append(this.$el);

        this.fullImagesMap = {};

        if (this.model.application.mode !== 'edit') {
            if (window.addEventListener) {
                // listener on changing window size to measure slide width
                window.addEventListener('resize', this.onWindowResize.bind(this), false);
            }

            this.model.bind("change:state", function() {

                if (this.model.application.mode === 'edit') {
                    this.render();
                }
                else {
                    if (this.model.get('state') === 'slider' && this.model.previous('state') === null) {
                        // проверяем предыдущее значение стейта: чтобы только в первый раз при старте приложение сделать этот рендер
                        this.model.application.showScreen(this);
                        this.render();
                    }

                    if (this.model.get('state') === 'slider' && this.model.previous('state') === 'result') {
                        // переход 'result' -> 'slider' путем сдвига экрана
                        this.move({
                            action: 'show'
                        });
                        this.model.application.result.move({
                            action: 'hide'
                        });
                    }
                }

            }, this);

            this.model.bind("change:slides", this.onMutAppPropertyChanged, this);
            this.model.bind("change:slideIndex", this.onSlideIndexChanged, this);

            if (document.readyState === "complete" || document.readyState === "interactive") {
                // если документ уже успел загрузиться к этому времени, то сразу вызвать обработчик с началом загрузки полных картинок
                this.requestFullImageLoading();
            }
            else {
                if (window.addEventListener && window.requestAnimationFrame && document.getElementsByClassName) {
                    window.addEventListener('load', this.requestFullImageLoading.bind(this));
                }
                else {
                    this.requestFullImageLoading();
                }
            }
        }
    },

    /**
     * Кастомная функция показа/скрытия экрана через transform
     *
     * @param param
     */
    move: function(param) {
        param = param || {};
        param.animation = (typeof param.animation === 'boolean') ? param.animation: true;
        param.action = param.action || 'hide';

        // при переходе между экранами выставляем текущий sliderIndex какой нужно
        //TODO перейти на app.getSize().width
        this.slideWidth = this.$slidesCnt.width();
        this.slideCntTranslateX = (-this.model.get('slideIndex')*this.slideWidth);
        this.$slidesCnt
            .removeClass('animate')
            .css('transform','translate3d(' + this.slideCntTranslateX + 'px,0,0)');

        if (param.animation === true) {
            this.$el.addClass('animate');
        }
        else {
            this.$el.removeClass('animate');
        }

        this.$el.show().css('position','absolute');
        if (param.action === 'show') {
            this.$el.css('transform','translate3d(0,0,0)');
        }
        else if (param.action === 'hide') {
            this.$el.css('transform','translate3d(' + (-this.slideWidth) + 'px,0,0)');
        }
    },

    /**
     *
     */
    requestFullImageLoading: function() {
        // проверяем что экран уже отрендерен
        var items = document.getElementsByClassName('progressive replace');
        if (this.fullImageLoadingRequested === false && items.length > 0) {
            this.fullImageLoadingRequested = true;
            var slides = this.model.get('slides').toArray();
            for (var i = 0; i < slides.length; i++) {
                this.loadFullImage(this.model.get('slides').getIdFromPosition(i));
            }
//            for (var i = 0; i < items.length; i++) {
//                this.loadFullImage(items[i]);
//            }
        }
    },

    /**
     * Replace with full image
     *
     * By https://www.sitepoint.com/how-to-build-your-own-progressive-image-loader/
     *
     * @param {string} slideDictionaryId
     */
    loadFullImage: function(slideDictionaryId) {
        console.log('Slider.loadFullImage');
//        if (!item || !item.attributes['data-img-src']) return;
        // load image
//        var $item = $('.js-slides_cnt').find('[data-img-src="'+imgSrc+'"]');
        var img = new Image();
//        if (item.dataset) {
//            img.srcset = item.dataset.srcset || '';
//            img.sizes = item.dataset.sizes || '';
//        }
//        var imgSrcAttr = item.attributes['data-img-src'].value;
        var imgSrc = this.model.get('slides').getValue()[slideDictionaryId].imgSrc.getValue();
        img.src = imgSrc;
        img.className = 'slider_img';
        if (img.complete) {
            addImg.call(this);
        }
        else {
            img.onload = addImg.bind(this);
        }
        // replace image
        function addImg() {
            // Важный момент: во время загрузки картинки может произойти render() и дом-элементы изменятся. Поэтому поиск надо производить заново по атрибуту
            // add full image
            var $item = $('.js-slides_cnt').find('[data-slide-dictionary-id="'+slideDictionaryId+'"]');
            $item.append(img);
            // сохраняем картинку для повторного использования при дальнейших рендерах
            this.fullImagesMap[slideDictionaryId] = img;
            // remove preview image
            //var pImg = item.querySelector && item.querySelector('img.preview');
            $item.find('img.preview').remove();
//            if (pImg) {
//                $item.remove(pImg);
//            }
        }
    },

    /**
     * При изменении размера окна
     * размер контейнера для слайдов скорее всего тоже изменится.
     * Нужно пересчитать
     */
    onWindowResize: function() {
        console.log('Slider.onWindowResize');
        setTimeout((function(){
            this.slideWidth = this.$slidesCnt.width();
            this.renderSlides();
            if (this.model.get('state') !== 'slider') {
                this.move({
                    animation: false,
                    action: 'hide'
                });
            }
        }).bind(this),0);
    },

    onMutAppPropertyChanged: function() {
        this.render();
    },

    /**
     * Произошло обновление текущего слайда
     * Нужно обновить текст подписи, прогресс бар и т.п.
     */
    onSlideIndexChanged: function() {
        var slides = this.model.get('slides').toArray();
        var slideIndex = this.model.get('slideIndex');
        var currentSlide = this.model.getSlideInfo(slideIndex);

        // текст для текущего слайда установить в интерфейс
        this.$el.find('.js-slide_text').html(currentSlide.text.getValue());

        // числовой индекс слайда обновить
        this.$el.find('.js-slide_num').text((slideIndex+1)+'/'+slides.length);

        // обновить маркеры прогресса
        for (var i = 0; i < this.$counters.length; i++) {
            var $c = this.$counters[i];
            if (slideIndex === i) {
                $c.addClass('__active');
            }
            else {
                $c.removeClass('__active');
            }
        }
    },

    //TODO в http://photoswipe.com/ идет подмена картинок, то есть после прокрутки три новые (ближайшие) становятся в слайдер, остальные удаляются
    render: function() {
        this.sliderItemsMap = {};

        this.$el.html(this.template['default']());
        this.$el.css('position','absolute').css('transform','translate3d(0,0,0)');
        this.$slidesCnt = $('.js-slides_cnt');

        // зачем я тут использовал setTimeout интересно?
//        setTimeout((function(){
            this.slideWidth = this.$slidesCnt.width();
            this.renderSlides();

            if (document.readyState === "complete" || document.readyState === "interactive") {
                // если документ уже успел загрузиться к этому времени, то сразу вызвать обработчик с началом загрузки полных картинок
                this.requestFullImageLoading();
            }
//        }).bind(this),0);

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
        console.log('Slider.renderSlides()');
        var $slc = this.$slidesCnt.empty();
        var slides = this.model.get('slides').toArray();
        var slideIndex = this.model.get('slideIndex');
        var currentSlider = this.model.getSlideInfo(slideIndex);
        var $counterCnt = this.$el.find('.js-slide_counter_cnt').empty();
        this.$counters = [];

        for (var i = 0; i < slides.length; i++) {
            var sl = slides[i];
            var dictionaryId = this.model.get('slides').getIdFromPosition(i);
            var $sliderItem = $(this.template['sliderItem']({
                img: sl.imgSrc.getValue(),
                img_thumb: sl.imgThumbSrc,
                display: 'block',
                slide_index: i,
                dictionaryId: dictionaryId
            }));

            if (this.fullImagesMap[dictionaryId]) {
                // для этой картинки уже создан объект Image
                // Возможно, даже загружен полностью, надо использовать его
                $sliderItem.find('img').remove();
                $sliderItem.append(this.fullImagesMap[dictionaryId]);
            }
            else {

            }

            var transform = 'translate3d('+(i*this.slideWidth)+'px,0,0)';
            $sliderItem.css('transform', transform);
            // сохраняем все вью в мапу
            this.sliderItemsMap[sl.imgSrc.getValue()] = $sliderItem;
            $slc.append($sliderItem);

            var $counterItem = $(this.template['counterItem']({
                active: i === slideIndex ? '__active': '',
                slide_index: i
            }));
            $counterCnt.append($counterItem);
            this.$counters.push($counterItem);
        }

        // текст текущего слайда поставить
        this.$el.find('.js-slide_text').html(currentSlider.text.getValue());
        // числовой индекс слайда обновить
        this.$el.find('.js-slide_num').text((slideIndex+1)+'/'+slides.length);

        this.slideCntTranslateX = (-slideIndex*this.slideWidth);
        this.$slidesCnt.css('transform','translate3d(' + this.slideCntTranslateX + 'px,0,0)');
        this.$sliderItems = $('js-slider_item');
    },

    /**
     * Измерить максимальную высоту этого экрана и сделать ее высотой приложения
     * Только экран может сам измерить свою высоту корректно
     *
     * Нужно пересчитывать при изменении размеров приложения, например, смене ориентации экрана устройства.
     */
    measureHeight: function() {
        // метка которая показывается на контейнере внизу проекта
        var testixLabel = 30;
        var scrHeight = 0;
        // высота этого экрана складывается из нескольких частей
        //.js-slider_wr
        //.js-slider_counter
        //.js-slide_text (с максимальным текстом)
        scrHeight += $('.js-slider_wr').outerHeight();
        scrHeight += $('.js-slider_counter').outerHeight();
        // Надо учесть максимальный размер текста, которые встретится на этом экране
        var maxTextHeight = 0;
        var $testDiv = $('<div class="text slide_text js-slide_text"></div>');
        $('body').append($testDiv);
        var slides = this.model.get('slides').toArray();
        for (var i = 0; i < slides.length; i++) {
            if (slides[i].text.getValue()) {
                $testDiv.html(slides[i].text.getValue());
                var th = $testDiv.outerHeight();
                if (th > maxTextHeight) {
                    maxTextHeight = th;
                }
            }
        }
        $testDiv.remove();
        scrHeight += maxTextHeight;
        scrHeight += testixLabel;

        return scrHeight;
    }
});