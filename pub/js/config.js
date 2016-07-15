/**
 * Created by artyom.grishanov on 25.12.15
 * Простой объект с конфигурацией
 */
var config = {
    /**
     * Возможность применить сразу набор свойств для быстрого переключения конфигурации
     * config.common.configurationSetsOnStart показывает какие наборы будут применены при запуске
     * Это также полезно для автотестов, чтобы тесты могли выставлять себе разную конфигурацию
     */
    congigurationSet: {
        dev: function() {
            config.common.devPrototypesHostName = 'http://localhost:63342/ProCo/pub/';
            config.common.facebookAppId = '518819781624579';
            config.common.awsEnabled = true;
            config.common.facebookAuthEnabled = true;
            return this;
        },
        test: function() {
            config.common.devPrototypesHostName = 'http://proco.surge.sh/';
            config.common.facebookAppId = '515132035326687';
            config.common.awsEnabled = true;
            config.common.facebookAuthEnabled = true;
            return this;
        },
        prod: function () {
            config.common.devPrototypesHostName = 'http://testix.me/';
            config.common.facebookAppId = '1734391910154130';
            config.common.awsEnabled = true;
            config.common.facebookAuthEnabled = true;
            return this;
        },
        offline: function() {
            config.common.awsEnabled = false;
            config.common.facebookAuthEnabled = false;
            return this;
        }
    },
    common: {
        /**
         * Перечисляет какие наборы свойств будут применены при старте приложения по умолчанию
         */
        configurationSetsOnStart: ['dev'],
        /**
         * хост для загрузки прототипов на редактирование
         * используется для локальной разрботки, чтобы получить достйп к iframe и не вызвать sequrity error
         * При деплое на продакш оставить пустым
         */
        devPrototypesHostName: null,
        /**
         * Проводить ли при старте инициализацию для работы с хранилищем амазона
         */
        awsEnabled: false,
        /**
         * Разрешать вход через FB
         */
        facebookAuthEnable: false,
        /**
         * Id приложения в facebook для логина
         */
        facebookAppId: null,
        /**
         * Хост для сохранения данных
         */
        awsHostName: 'https://s3.eu-central-1.amazonaws.com/',
        awsBucketName: 'proconstructor',
        awsRoleArn: 'arn:aws:iam::520270155749:role/ProCo_FBUsers',
        awsRegion: 'eu-central-1',
        /**
         * Разрешает вывод в консоль console.log
         */
        consoleLogEnable: true,
        /**
         * Показывать ли редактор и инициализировать все контролы
         */
        editorUiEnable: true,
        /**
         * Имя get параметра для передачи ссылки на шаблон
         * если указан этот параметр то app-параметр игнорируется
         */
        templateUrlParamName: 'template',
        /**
         * Имя get параметра для передачи ссылки открытие в редакторе
         */
        appNameParamName: 'app',
        /**
         * Имя get параметра для указания, что проект надо клонировать
         */
        cloneParamName: 'clone',
        /**
         * Имя get параметра для указания, что нужно сгенерировать новый ид для приложения
         */
        needNewIdParamName: 'newId',
        /**
         * Параметр передающий ссылку на опубликованное приложение
         */
        publishedProjParamName: 'pp',
        /**
         * Теги, которыми будет обрамлены новые параметры перезаписывании
         */
        tagsForOverridingParams: ['/*<overrideapp>*/','/*</overrideapp>*/'],
        /**
         *
         */
        angularAppName: 'procoApp',
        /**
         * Имя файла превью для проекта при условии что его ставит сам пользователь, а не автоматическая генерация
         */
        userCustomPreviewFileNamePrefix: 'userCustomPreview_',
        /**
         * Автоматическая генерация превью проекта при его сохранении
         * Берется текущий экран и перегоняется в jpeg
         */
        previewAutoGeneration: true,
        /**
         * Метод для генерации превью html элемента
         * Доступны следующие библиотеки
         * html2canvas | rasterizeHTML
         */
        previewMethod: 'html2canvas',
        /**
         * Надо ли генерировать превью всех экранов приложения для контрола Slide
         */
        generateSlidePreviews: true
    },
    products: {
        // конфигурация для каждого типа промо-приложений
        test: {
            prototypeId: 'test_v0.1',
            /**
             * Само приложение для загрузки через iframe
             */
            src: 'products/test/index.html',
            /**
             * каталог откуда publisher будет брать все ресурсы для публикации проекта
             */
            baseProductUrl: 'products/test/',
            backgrounds: [
                //TODO брать параметры из других параметров config.common.awsHostName
                'url('+'https://s3.eu-central-1.amazonaws.com/'+'proconstructor/facebook-902609146442342/test1/i/ny-regents-exam-global-history-and-geography-help-course_132147_large.jpg)',
                'url('+'https://s3.eu-central-1.amazonaws.com/'+'proconstructor/facebook-902609146442342/test1/i/Globe7.jpg)',
                'url('+'https://s3.eu-central-1.amazonaws.com/'+'proconstructor/facebook-902609146442342/test1/i/location.jpg.pagespeed.ce.wvqZyH3ZXu.jpg)',
                'url('+'https://s3.eu-central-1.amazonaws.com/'+'proconstructor/facebook-902609146442342/test1/i/Geography-1-landing.jpg)'
            ],
            fontColors: ['#fff',
                'rgb(177, 193, 155)',
                '#00A651',
                'rgb(195, 186, 186)'
            ],
            fontFamilies:  ['Arial, Helvetica, sans-serif',
                '"Times New Roman", Times, serif',
                'Impact, Charcoal, sans-serif',
                '"Courier New", Courier, monospace'
            ]
        },
        timeline: {

        },
        smartimage: {

        }
    },
    controls: {
        TextQuickInput: {
            defaultDirectiveIndex: -1, // view не используется
            directives: [/*'textquickinput'*/],
            parentId: 'id-control_cnt',
            type: 'workspace' // контрол появляется на поле для редактиования, когда показывается экран приложения
        },
        Slide: {
            defaultDirectiveIndex: 0,
            directiveLoadPriority: 10, // специальный приоритет для более быстрой загрузки контрола, высокий для более важных
            directives: ['slide'],
            parentId: null // вставляется в группу контролов Slide
        },
        AddArrayElementControl: {
            defaultDirectiveIndex: 0,
            directives: ['addquickbutton','addscreenbutton'],
            parentId: 'id-control_cnt',
            type: 'workspace' // контрол появляется на поле для редактиования, когда показывается экран приложения
        },
        DeleteQuickButton: {
            defaultDirectiveIndex: 0,
            directives: ['deletequickbutton'],
            parentId: 'id-control_cnt',
            type: 'workspace' // контрол появляется на поле для редактиования, когда показывается экран приложения
        },
        OnOff: {
            defaultDirectiveIndex: 0,
            directives: ['onoffswitcher'],
            parentId: 'id-static_controls_cnt',
            type: 'controlpanel'
        },
        StringControl: {
            defaultDirectiveIndex: 0,
            directives: ['textinput', 'colorpicker'],
            parentId: 'id-static_controls_cnt',
            type: 'controlpanel'
        },
        Drag: {
            defaultDirectiveIndex: 0,
            directives: ['drag'],
            parentId: 'id-control_cnt',
            type: 'workspace' // контрол появляется на поле для редактиования, когда показывается экран приложения
        },
        Alternative: {
            defaultDirectiveIndex: 0,
            directives: ['dropdown','radiobutton','altbuttons'],
            parentId: 'id-static_controls_cnt',
            type: 'controlpanel'
        },
        SlideGroupControl: {
            defaultDirectiveIndex: 0,
            directives: ['slidegroupcontrol'],
            parentId: null
        },
        ChooseImageQuick: {
            defaultDirectiveIndex: -1, // view не используется
            directives: [],
            parentId: 'id-control_cnt',
            type: 'workspace' // контрол появляется на поле для редактиования, когда показывается экран приложения
        }
    },
    editor: {
        ui: {
            /**
             * z-index который ставится рамку выделения, которая появляется при клике на элемент промо приложения
             */
            selectionBorderZIndex: 9,
            /**
             * z-index который ставится на контрол при его активации (показе).
             * Это контролы которые показываются прямо в поле редактирования.
             */
            quickControlsZIndex: 10,
            /**
             * z-index который ставится элементу при перетаскивании внутри контрола ArrayControl
             */
            arrayControlDragZIndex: 20,
            /**
             * zIndex подсказок
             */
            hintZIndex: 30,
            /**
             * Отступы, насколько можно вынести перетаскиваемый элемент за границы группы
             */
            slideGroupLeftDragMargin: 10,
            slideGroupRightDragMargin: 10,
            /**
             * Утступы слева и справа от промежуточных кнопок в слайдереэ экранов
             */
            slideInterimBtnMargins: 6,
            /**
             * Отступ от хинта до элемента, на который он указывает
             */
            hintRightMargin: 7
        }
    },
    ui: {
        modalsParentSelector: '#id-modal_cnt'
    },
    /**
     * Описание типов стандартных модальных окон, которые встречаются почти на всех веб страницах
     * Это конечно не то же вью что и сама вею страница:
     * - создается "на лету"
     * - добавляются в свой контейнер
     * -
     * Общее:
     * - также синглтон
     * - имеет общую логику по управлению
     *
     * логика по работе с версткой этого вью где?
     * сама витрина тоже вью?
     *
     * функция показа
     * функция скрытия
     *
     * вью запрашивают данные у модели
     * вью запрашивают показ любых других вью
     * модуль запрашивает показ вью
     */
    modals: {
        loadingModal: {
            templateUrl: 'templates/loadingModal.html',
            defZIndex: 101
        },
        loginModal: {
            templateUrl: 'templates/loginModal.html',
            defZIndex: 100
        },
        messageModal: {
            templateUrl: 'templates/messageModal.html',
            defZIndex: 102
        }
    }
};

// применение конфигураций по умолчанию
if (config.common.configurationSetsOnStart && config.common.configurationSetsOnStart.length > 0) {
    for (var i = 0; i < config.common.configurationSetsOnStart.length; i++) {
        var setName = config.common.configurationSetsOnStart[i];
        config.congigurationSet[setName].call(this);
    }
}