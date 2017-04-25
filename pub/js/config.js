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
            config.common.home = 'http://localhost:63342/ProCo/pub/';
            config.common.facebookAppId = '518819781624579';
            config.common.awsEnabled = true;
            config.common.facebookAuthEnabled = true;
//            config.scripts.ga.enable = false;
//            config.scripts.yaMetrika.enable = true;
            config.scripts.jivoSite.enable = false;
            return this;
        },
        test: function() {
            config.common.home = 'http://test.testix.me/';
            config.common.facebookAppId = '515132035326687';
            config.common.awsEnabled = true;
            config.common.facebookAuthEnabled = true;
//            config.scripts.ga.enable = false;
//            config.scripts.yaMetrika.enable = false;
            config.scripts.jivoSite.enable = false;
            return this;
        },
        prod: function () {
            config.common.home = 'http://testix.me/';
            config.common.facebookAppId = '1734391910154130';
            config.common.awsEnabled = true;
            config.common.facebookAuthEnabled = true;
//            config.scripts.ga.enable = true;
//            config.scripts.yaMetrika.enable = true;
            config.scripts.jivoSite.enable = true;
            return this;
        },
        offline: function() {
            config.common.awsEnabled = false;
            config.common.facebookAuthEnabled = false;
//            config.scripts.ga.enable = false;
//            config.scripts.yaMetrika.enable = false;
            config.scripts.jivoSite.enable = false;
            return this;
        },
        online: function() {
            config.common.awsEnabled = true;
            config.common.facebookAuthEnabled = true;
            return this;
        }
    },
    common: {
        /**
         * Перечисляет какие наборы свойств будут применены при старте приложения по умолчанию
         */
        configurationSetsOnStart: ['dev'], //dev test prod
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
        facebookAuthEnabled: false,
        /**
         * Id приложения в facebook для логина
         */
        facebookAppId: null,
        /**
         * Хост для сохранения данных
         */
        awsHostName: 'https://s3.eu-central-1.amazonaws.com/',
        awsBucketName: 'proconstructor',
        awsPublishedProjectsBucketName: 'p.testix.me',
        awsRoleArn: 'arn:aws:iam::520270155749:role/ProCo_FBUsers',
        awsRegion: 'eu-central-1',
        /**
         * Задержка перед возможностью релогина
         * Применяется когда сессия устаревает
         */
        RELOGIN_DELAY: 60000, // 1 min
        /**
         * Доступен ли редактор для запуска всем пользователям.
         * Если нет, то будет покаано сообщение "пока в разработке"
         * Но по прямой ссылке можно будет всегда зайти
         */
        editorIsUnderConstruction: false,
        /**
         * Список fb ид пользователей которые могут зайти в редактор в то время как
         * editorIsUnderConstruction === true
         */
        editorIsUnderConstructionWhitelist: ['1045302892173346','121947341568004','127867420975996'],
        /**
         * Не отправлять программные события для этих пользователей
         * При условии, что они залогинены конечно
         * В разных приложениях/доменах ид пользователя может быть разный
         */
        excludeUsersFromStatistic: [
            '1008194042550518', //artem grishanov
            '1045302892173346', //oleg lukinov
            '121947341568004', //семен робот
            '127867420975996', //oleg lukinov
            '902609146442342', //artem grishanov
            '937567369613566' //oleg lukinov
        ],
        /**
         * Хост для опубликованных проектов
         */
        publishedProjectsHostName: 'http://p.testix.me/',
        /**
         * Разрешает вывод в консоль console.log
         */
        consoleLogEnable: true,
        /**
         * Показывать ли редактор и инициализировать все контролы
         */
        editorUiEnable: true,
        /**
         * Установленный язык в верстке
         * При старте ключи будут взяты из верстки и положены в словарь
         */
        langInHTMLfiles: 'RU',
        /**
         * Язык который стоит в интерфейсе по умолчанию
         * @type {string}
         */
        defaultLang: 'RU', // 'EN'
        /**
         * Имя гет-параметра, которым можно установить локализацию файла
         * Например: "en" или "ru", поддерживаемые языки в app.js
         */
        langParamName: 'lang',
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
         * Параметр передающий ссылку на опубликованное приложение
         */
        publishedProjParamName: 'pp',
        /**
         * Имя параметра для передачи значения в хранилище для приложения mutapp
         */
        appStorageParamName: 'appStorage',
        /**
         * Теги, которыми будет обрамлены новые параметры перезаписывании
         */
        tagsForOverridingParams: ['/*<overrideapp>*/','/*</overrideapp>*/'],
        /**
         * Имя файла превью для проекта при условии что его ставит сам пользователь, а не автоматическая генерация
         */
        userCustomPreviewFileNamePrefix: 'userCustomPreview_',
        /**
         * префикс для картинки шаринга
         */
        shareFileNamePrefix: 'share_',
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
        generateSlidePreviews: true,
        /**
         * Id элемента, в который пишутся кастомные стили во время редактирования в редакторе
         */
        previewCustomStylesId: 'id-custom_style',
        /**
         * Анонимная страница для публикации
         */
        //        anonymPageForPublishing: 'templates/anonymPage/index.html',
        //        anonymPageStylesForPublishing: 'css/common.css',
        /**
         * Место куда в анонимную страницу вставлять код проекта при публикации
         */
        anonymPageAnchorToEmbed: '<!--embed_code-->',
        /**
         * Если в прилжении стоит вот такая ссылка, то она будет автоматически заменена при старте редактора
         * на ссылку вида http://p.testix.me/121947341568004/be169f9a66
         */
        defaultShareLinkToChange: 'https://testix.me/',
        /**
         * Редактор по этому идентификатору ищет свойство и записывает туда картинки для публикации
         */
        shareImagesAppPropertyString: 'appConstructor=mutapp _shareEntities.{{number}}.imgUrl',
        /**
         * Шаблон для кода встраивания
         */
        embedCodeTemplate: '<div class="testix_project" data-width="{{width}}" data-height="{{height}}" data-published="{{published}}"><script src="//testix.me/js/loader.js" async></script></div>'
    },
    storage: {
        /**
         * Максимальное время которое может занять аплоад нового ресурса, картинки
         */
        putNewResourceMaxDelay: 12000,
        /**
         * Сколько по времени можем ждать ответа от сервисов типа aws
         * для аплоада оно может быть увеличено, так как там большие файлы могут быть
         */
        responseMaxDuration: 6000
    },
    jpegEncoder: {
        /**
         * Превью и прочие генерируемые канвасы
         * Также влияет на качество панорам. Там вес критичен
         * Значение 100 - дает слишком большой вес файла
         */
        JPEGEncoderQuality: 70,
        writeAPP0: true,
        writeAPP1: false,
        /**
         * Данные используемые для записи в раздер APP1 в jpeg
         */
        APP1DATA: {
            namespace: '',
            string: ''
        }
    },
    /**
     * Конфигурация витрины
     * Используется для построения витрины и также автотестов на шаблоны
     * Устанавливается через применение настроек configurationSet
     */
    storefront: {
        /**
         * Категория, которая открывается по умолчанию
         */
        defaultCategory: 'all',
        allCategoryKey: 'all',
        templates: [],
        categories: {
            all: {
                enabled: true,
                // заполняется программно в storefront -> init на основе других категорий
                entities: []
            },
            test: {
                // шаблоны встроены прямо в верстку, НЕ создаются программно
                enabled: true,
                typeLabel: {EN:'Quiz',RU:'Тест'},
                entities: [
                    {
                        // стандартный тест: http://p.testix.me/1045302892173346/7e7fef7bcf
                        name: {EN:'Default tutorial quiz',RU:'Testix. Дефолтный тест-туториал'},
                        img: 'http://p.testix.me/storefront/test/7e7fef7bcf.jpg',
                        published: 'http://p.testix.me/storefront/test/7e7fef7bcf/p_index.html',
                        template: 'storefront/test/7e7fef7bcf.txt',
                        width: '800px',
                        height: '600px'
                    },
                    {
                        // президенты США тест: http://p.testix.me/1045302892173346/02f9e0d7c7/
                        name: {EN:'American presidents',RU:'Президенты США'},
                        img: 'http://p.testix.me/storefront/test/02f9e0d7c7.jpg',
                        published: 'http://p.testix.me/storefront/test/02f9e0d7c7/p_index.html',
                        template: 'storefront/test/02f9e0d7c7.txt',
                        width: '800px',
                        height: '600px'
                    },
                    {
                        // угадайте книгу по цитате: http://p.testix.me/1045302892173346/e33f556579
                        name: {EN:'Independent Media',RU:'Независимое издание'},
                        img: 'http://p.testix.me/storefront/test/e33f556579.jpg',
                        published: 'http://p.testix.me/storefront/test/e33f556579/p_index.html',
                        template: 'storefront/test/e33f556579.txt',
                        width: '800px',
                        height: '600px'
                    },
                    {
                        // любят ли вас деньги: http://p.testix.me/1045302892173346/85c20b7628
                        name: {EN:'Financial Media',RU:'Финансовое издание'},
                        img: 'http://p.testix.me/storefront/test/85c20b7628.jpg',
                        published: 'http://p.testix.me/storefront/test/85c20b7628/p_index.html',
                        template: 'storefront/test/85c20b7628.txt',
                        width: '800px',
                        height: '600px'
                    },
                    {
                        // тест по психологии "Ты душа компании или зануда": http://p.testix.me/1045302892173346/1059f38c8b
                        name: {EN:'Psychology and Relationships',RU:'Психология и отношения'},
                        img: 'http://p.testix.me/storefront/test/1059f38c8b.jpg',
                        published: 'http://p.testix.me/storefront/test/1059f38c8b/p_index.html',
                        template: 'storefront/test/1059f38c8b.txt',
                        width: '800px',
                        height: '600px'
                    },
                    {
                        // тест для художников: http://p.testix.me/1045302892173346/9000e567da
                        name: {EN:'Paintings',RU:'Картины'},
                        img: 'http://p.testix.me/storefront/test/9000e567da.jpg',
                        published: 'http://p.testix.me/storefront/test/9000e567da/p_index.html',
                        template: 'storefront/test/9000e567da.txt',
                        width: '800px',
                        height: '600px'
                    },
//                    {
//                        //  Киев: http://p.testix.me/1045302892173346/870dcd0a6b
//                        name: 'Знаешь ли ты Киев?',
//                        img: 'http://p.testix.me/storefront/test/870dcd0a6b.jpg',
//                        published: 'http://p.testix.me/storefront/test/870dcd0a6b/p_index.html',
//                        template: 'storefront/test/870dcd0a6b.txt',
//                        width: '800px',
//                        height: '600px'
//                    }
                    {
                        // тест по географии "Пенза или Пиза": http://p.testix.me/1045302892173346/d61333fd5e
                        name: {EN:'Geography quiz',RU:'Тест по географии'},
                        img: 'http://p.testix.me/storefront/test/d61333fd5e.jpg',
                        published: 'http://p.testix.me/storefront/test/d61333fd5e/p_index.html',
                        template: 'storefront/test/d61333fd5e.txt',
                        width: '800px',
                        height: '600px'
                    },
                    {
                        // тест по русскому языку: http://p.testix.me/1045302892173346/e4d58cd89b
                        name: {EN:'Test of Russian language',RU:'Тест по русскому языку'},
                        img: 'http://p.testix.me/storefront/test/e4d58cd89b.jpg',
                        published: 'http://p.testix.me/storefront/test/e4d58cd89b/p_index.html',
                        template: 'storefront/test/e4d58cd89b.txt',
                        width: '800px',
                        height: '600px'
                    },
                    {
                        // тест "Какой вы инвестор": http://p.testix.me/1045302892173346/39d1a71943
                        name: {EN:'What kind of investor are you?',RU:'Какой вы инвестор?'},
                        img: 'http://p.testix.me/storefront/test/39d1a71943.jpg',
                        published: 'http://p.testix.me/storefront/test/39d1a71943/p_index.html',
                        template: 'storefront/test/39d1a71943.txt',
                        width: '800px',
                        height: '600px'
                    }
                ]
            },
            memoriz: {
                enabled: true,
                typeLabel: {EN:'Memory Game',RU:'Игра мемори'},
                entities: [
                    {
                        //Интернет мемы http://p.testix.me/1045302892173346/13e4d14521/
                        name: {RU:'Интернет-мемы',EN:'Online memes'},
                        img: 'http://p.testix.me/storefront/memoriz/13e4d14521.jpg',
                        published: 'http://p.testix.me/storefront/memoriz/13e4d14521/p_index.html',
                        // in proconstructor/storefront/memoriz
                        template: 'storefront/memoriz/13e4d14521.txt',
                        width: '800px',
                        height: '600px'
                    },
                    {
                        //Футболисты http://p.testix.me/1045302892173346/53b37bf1e9
                        name: {RU:'Футболисты',EN:'Soccer players'},
                        img: 'http://p.testix.me/storefront/memoriz/53b37bf1e9.jpg',
                        published: 'http://p.testix.me/storefront/memoriz/53b37bf1e9/p_index.html',
                        // in proconstructor/storefront/memoriz
                        template: 'storefront/memoriz/53b37bf1e9.txt',
                        width: '800px',
                        height: '600px'
                    },
                    {
                        //Фильмы и режиссеры  http://p.testix.me/121947341568004/6842f5cd6d/
                        name: {RU:'Кино и режиссеры',EN:'Movies and directors'},
                        img: 'http://p.testix.me/storefront/memoriz/6842f5cd6d.jpg',
                        published: 'http://p.testix.me/storefront/memoriz/6842f5cd6d/p_index.html',
                        // in proconstructor/storefront/memoriz
                        template: 'storefront/memoriz/6842f5cd6d.txt',
                        width: '800px',
                        height: '600px'
                    },
                    {
                        //Автомобили http://p.testix.me/121947341568004/06cc56a6dc/ republished by bot
                        // http://p.testix.me/1045302892173346/06cc56a6dc (Oleg origin)
                        name: {RU:'Автомобили',EN:'Cars'},
                        img: 'http://p.testix.me/storefront/memoriz/06cc56a6dc.jpg',
                        published: 'http://p.testix.me/storefront/memoriz/06cc56a6dc/p_index.html',
                        // in proconstructor/storefront/memoriz
                        template: 'storefront/memoriz/06cc56a6dc.txt',
                        width: '800px',
                        height: '600px'
                    },
                    {
                        //Красотки http://p.testix.me/121947341568004/e78a9cd599/ republished by bot
                        // http://p.testix.me/1045302892173346/e78a9cd599/ (Oleg origin)
                        name: {RU:'Красотки',EN:'Beauty'},
                        img: 'http://p.testix.me/storefront/memoriz/e78a9cd599.jpg',
                        published: 'http://p.testix.me/storefront/memoriz/e78a9cd599/p_index.html',
                        // in proconstructor/storefront/memoriz
                        template: 'storefront/memoriz/e78a9cd599.txt',
                        width: '800px',
                        height: '600px'
                    }
                ]
            },
            panorama: {
                typeLabel: {EN:'Panoramas',RU:'Панорамы'},
                enabled: true,
                entities: [
                    {
                        //Сингапур http://p.testix.me/121947341568004/1d1f4f3236/
                        name: {RU:'Сингапур',EN:'Singapore'},
                        img: 'http://p.testix.me/storefront/panorama/1d1f4f3236.jpg',
                        published: 'http://p.testix.me/storefront/panorama/1d1f4f3236/p_index.html',
                        // in proconstructor/storefront/panorama
                        template: 'storefront/panorama/1d1f4f3236.txt',
                        width: '800px',
                        height: '600px',
                        getParams: 'appStorage=ref:strf'
                    }
                ]
            },
            fbPanorama: {
                typeLabel: {EN:'Facebook panorama',RU:'Facebook панорама'},
                enabled: true,
                entities: [
                    {
                        name: {RU:'Римские руины',EN:'Roman ruins'},
                        img: 'http://p.testix.me/storefront/fbPanorama/fa724312dd.jpg',
                        published: null,
                        externalLink: 'https://www.facebook.com/photo.php?fbid=266745550421515&set=a.256225194806884.1073741833.100012582155261&type=3&theater',
                        // in proconstructor/storefront/fbPanorama
                        template: 'storefront/fbPanorama/fa724312dd.txt',
                        width: '800px',
                        height: '600px',
                        getParams: 'appStorage=ref:strf'
                    }
                ]
            },
            timeline: {
                typeLabel: {RU:'Таймлайн',EN:'Timeline'},
                enabled: false
            },
            zoommap: {
                typeLabel: {RU:'Zoom-карта',EN:'Zoom-map'},
                enabled: false
            }
        }
    },
    products: {
        /**
         * Общие для всех продуктов настройки
         */
        common: {
            /**
             * Продукт может подключить эти общие для всех стили.
             * Там например содержаться кнопки для шаринга
             */
            styles: '<link href="{{config.common.home}}products/common/css/tstx_cmn_products.css" rel="stylesheet"/>',
//            stylesForPublishing: '',
//            stylesFileName: 'tstx_cmn_products.css',
            defaultShareImageRecommendedSize: '1200x620',
            publishResources: [
                {
                    // ex: products/test_new/
                    baseUrl: undefined, // не указана, значит будет установлена publisher.js
                    // index.html промо проекта
                    url: 'index.html',
                    destUrl: 'p_index.html',
                    type: 'text/html',
                    // замена подстроки в этом файле при публикации
                    replace: [{
                        from: '<script type="text/javascript" src="../common/js/mutapp.js"></script>',
                        to: '<script type="text/javascript" src="mutapp.js"></script>'
                    },{
                        from: '<link href="../common/css/tstx_cmn_products.css" rel="stylesheet">',
                        to: '<link href="tstx_cmn_products.css" rel="stylesheet">'
                    }]
                },
                {
                    baseUrl: '', // not needed
                    url: 'templates/anonymPage/index.html',
                    // анонимка должна открываться по умолчанию
                    destUrl: 'index.html',
                    type: 'text/html'
                },
                {
                    baseUrl: '', // not needed
                    url: 'css/common.css',
                    destUrl: 'common.css',
                    type: 'text/css'
                },
                {
                    baseUrl: '', // not needed
                    url: 'products/common/css/tstx_cmn_products.css',
                    destUrl: 'tstx_cmn_products.css',
                    type: 'text/css'
                },
                {
                    baseUrl: '', // not needed
                    url: 'products/common/js/mutapp.js',
                    destUrl: 'mutapp.js',
                    type: 'text/javascript'
                }
            ]
        },
        // конфигурация для каждого типа промо-приложений
        test: {
            prototypeId: 'test_v1.0',
            /**
             * Имя функции с помощью которой создается приложение этого типа
             */
            constructorName: 'TestApp',
            /**
             * Само приложение для загрузки через iframe
             */
            src: 'products/test_new/index.html',
            /**
             * В зависимости от открытого промо проекта надо уметь вот так возвращать ссылку на его стили, чтобы встроить их в ifrmae
             * Нужно для превью в контроле Slide
             */
            stylesForEmbed: '<link href="{{config.common.home}}products/test_new/style.css" rel="stylesheet"/>',
            /**
             * каталог откуда publisher будет брать все ресурсы для публикации проекта
             */
            baseProductUrl: 'products/test_new/',
            /**
             * Ширина по умолчанию, если не задана
             */
            defaultWidth: 800,
            /**
             * Высота по умолчанию, если не задана
             */
            defaultHeight: 600,
            /**
             *
             */
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
            ],
            /**
             * Свойства предназначенные для автотестов
             */
            autotests: {
                expectedPropertiesCount: 120,
                expectedScreensCount: 8,
                expectedTriggersCount: 3,
                expectedSerializedAppStringLength: 4000
            }
        },
        memoriz: {
            /**
             * Имя функции с помощью которой создается приложение этого типа
             */
            constructorName: 'MemorizApp',
            /**
             * Само приложение для загрузки через iframe
             */
            src: 'products/memoriz/index.html',
            /**
             * В зависимости от открытого промо проекта надо уметь вот так возвращать ссылку на его стили, чтобы встроить их в ifrmae
             * Нужно для превью в контроле Slide
             */
            stylesForEmbed: '<link href="{{config.common.home}}products/memoriz/css/style.css" rel="stylesheet"/>',
            /**
             * каталог откуда publisher будет брать все ресурсы для публикации проекта
             */
            baseProductUrl: 'products/memoriz/',
            /**
             * Ширина по умолчанию, если не задана
             */
            defaultWidth: 800,
            /**
             * Высота по умолчанию, если не задана
             */
            defaultHeight: 600,
        },
        fbPanorama: {
            /**
             * Имя функции с помощью которой создается приложение этого типа
             */
            constructorName: 'FbPanoramaApp',
            /**
             * Само приложение для загрузки через iframe
             */
            src: 'products/fbPanorama/index.html',
            /**
             * В зависимости от открытого промо проекта надо уметь вот так возвращать ссылку на его стили, чтобы встроить их в ifrmae
             * Нужно для превью в контроле Slide
             */
            stylesForEmbed: '<link href="{{config.common.home}}products/fbPanorama/css/style.css" rel="stylesheet"/>',
            /**
             * каталог откуда publisher будет брать все ресурсы для публикации проекта
             */
            baseProductUrl: 'products/fbPanorama/',
            /**
             * Ширина по умолчанию, если не задана
             */
            defaultWidth: 800,
            /**
             * Высота по умолчанию, если не задана
             */
            defaultHeight: 600,
            /**
             * Кастомный класс паблишера, который будет испльзоваться при публикации
             * Файл с кодом лежит в products/fbPanorama
             *
             */
            customPublisherObject: 'fbPanoramaPublisher',
            /**
             * Добавлять ли тестовый заголовок при публикации в ФБ, чтобы понятно было с помощью какой конфигурации создана данная панорама.
             */
            addDebugCaption: false,
            /**
             * Включает сбор специальной статистики во время публикации панорам
             */
            enableCustomStatistics: true,
        },
        timeline: {
            stylesForEmbed: '<link href="{{config.common.home}}products/timeline/style.css" rel="stylesheet"/>'
        },
        smartimage: {
            stylesForEmbed: '<link href="{{config.common.home}}products/smartimage/style.css" rel="stylesheet"/>'
        }
    },
    controls: {
        TextQuickInput: {
            defaultDirectiveIndex: -1, // view не используется
            directives: [/*'textquickinput'*/],
            parentId: 'id-control_cnt',
            type: 'workspace' // контрол появляется на поле для редактиования, когда показывается экран приложения
        },
        ClickAndAddToArray: {
            defaultDirectiveIndex: -1, // view не используется
            directives: [],
            parentId: 'id-control_cnt',
            type: 'workspace' // контрол появляется на поле для редактиования, когда показывается экран приложения
        },
        Slide: {
            defaultDirectiveIndex: 0,
            directives: ['slide'],
            parentId: null // вставляется в группу контролов Slide
        },
        AddArrayElementControl: {
            defaultDirectiveIndex: 0,
            directives: ['addquickbutton','addscreenbutton'],
            parentId: 'id-control_cnt',
            type: 'quickcontrolpanel' // контрол появляется на всплывающей панельке рядом с элементом
        },
        DeleteQuickButton: {
            defaultDirectiveIndex: 0,
            directives: ['deletequickbutton'],
            parentId: 'id-control_cnt',
            type: 'quickcontrolpanel' // контрол появляется на всплывающей панельке рядом с элементом
        },
        OnOff: {
            defaultDirectiveIndex: 0,
            directives: ['onoffswitcher'],
            parentId: 'id-static_controls_cnt',
            type: 'controlpanel',
            labelInControl: true // label будет записан внуть контрола в элемент js-label
        },
        ChooseImage: {
            defaultDirectiveIndex: 0,
            directives: ['chooseimage','chooseimagepreview'],
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
            directives: ['dropdown',/*'radiobutton',*/'altbuttons'],
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
        },
        CustomQuickPanelControl: {
            defaultDirectiveIndex: 0,
            directives: ['customquickpanelcontrol'],
            parentId: 'id-control_cnt',
            type: 'quickcontrolpanel' // контрол появляется на всплывающей панельке рядом с элементом
        },
        CustomQControl: {
            defaultDirectiveIndex: 0,
            directives: ['customqcontrol'],
            parentId: 'id-control_cnt',
            type: 'workspace'
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
             * z-index топ-бара (где кнопка опубликовать)
             * программно не ставится, только в css
             */
            topZIndex: 25,
            /**
             * zIndex подсказок
             */
            hintZIndex: 30,
            /**
             * Всплывашка с предпросмотром проекта
             */
            appPreviewZIndex: 35,  //.st_preview_app_wr
            /**
             * Диалог выбора, например выбор типа вопроса теста selectDialog.js
             */
            selectDialogZIndex: 35,
            /**
             * z-index панели быстрого редактирования, которая всплывает рядом с элементом и указывает на него
             */
            quickControlPanelZIndex: 35,
            /**
             * Отступы, насколько можно вынести перетаскиваемый элемент за границы группы
             */
            slideGroupLeftDragMargin: 10,
            slideGroupRightDragMargin: 10,
            /**
             * Отступы слева и справа от промежуточных кнопок в слайдереэ экранов
             */
            slideInterimBtnMargins: 6,
            /**
             * Отступ от хинта до элемента, на который он указывает
             */
            hintRightMargin: 7,
            /**
             * боттом паддинг в стиле product_cnt.css/.screen_block
             * Он нужен для подсчета общей высоты редактора при добавлении нескольких экранов
             */
            screen_blocks_padding: 20,
            /**
             * Толщина обводки в стиле product_cnt.css/.screen_block
             * Надо для расчета ширины контейнера
             */
            screen_blocks_border_width: 0, //было 4px, убрал обводку
            /**
             * Скорость прокрутки превью слайдов
             */
            slidesScrollSpeed: 20,
            /**
             * Прибавка к высоте для id_product_cnt
             * Чтобы влазили: screen_blocks_padding (см выше), editor.css->.workspace_screens_iframe:top=20px, высота горизонтального системного скрол бара 20px примерно
             * который появляется если нужна горизонтальная прокрутка
             */
            id_product_cnt_additional_height: 60
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
        },
        previewShareImageModal: {
            templateUrl: 'templates/previewShareImageModal.html',
            defZIndex: 90
        },
        requestFBPublishPermissionsModal: {
            templateUrl: 'templates/requestFBPublishPermissionsModal.html',
            defZIndex: 103
        }
    },
    scripts: {
//        '22.03.2017' - при быстром закрытии страницы такой "умный" способ вставки кода не успевает работать и конверсия не считается.
//        ga: {
//            enabled: false,
//            code: '<script>(function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,"script","https://www.google-analytics.com/analytics.js","ga");ga("create", "UA-88595022-1", "auto");ga("send", "pageview");</script>'
//        },
//        '12.03.2017' - начало эксперимента по статичной вставке кода. Так как веб-визор иногда отказывается работать.
//        yaMetrika: {
//            enabled: false,
//            code: '<!-- Yandex.Metrika counter --><script type="text/javascript">(function (d, w, c) {(w[c] = w[c] || []).push(function() {try {w.yaCounter37720792 = new Ya.Metrika({id:37720792,clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});} catch(e) { }});var n = d.getElementsByTagName("script")[0],s = d.createElement("script"),f = function () { n.parentNode.insertBefore(s, n); };s.type = "text/javascript";s.async = true;s.src = "https://mc.yandex.ru/metrika/watch.js";if (w.opera == "[object Opera]") {d.addEventListener("DOMContentLoaded", f, false);} else { f(); }})(document, window, "yandex_metrika_callbacks");</script><noscript><div><img src="https://mc.yandex.ru/watch/37720792" style="position:absolute; left:-9999px;" alt="" /></div></noscript><!-- /Yandex.Metrika counter -->'
//        },
        jivoSite: {
            enabled: false,
            code: '<!-- BEGIN JIVOSITE CODE {literal} --><script type=\'text/javascript\'>(function(){ var widget_id = \'45oOHsZGmj\';var d=document;var w=window;function l(){var s = document.createElement(\'script\'); s.type = \'text/javascript\'; s.async = true; s.src = \'//code.jivosite.com/script/widget/\'+widget_id; var ss = document.getElementsByTagName(\'script\')[0]; ss.parentNode.insertBefore(s, ss);}if(d.readyState==\'complete\'){l();}else{if(w.attachEvent){w.attachEvent(\'onload\',l);}else{w.addEventListener(\'load\',l,false);}}})();</script><!-- {/literal} END JIVOSITE CODE -->'
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

config.products.common.styles = config.products.common.styles.replace('{{config.common.home}}',config.common.home);
for (var key in config.products) {
    if (config.products[key].stylesForEmbed) {
        config.products[key].stylesForEmbed = config.products[key].stylesForEmbed.replace('{{config.common.home}}',config.common.home);
    }
}