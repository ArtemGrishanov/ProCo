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
            config.common.home = 'http://localhost:63342/ProCo/pub/'; // меняется на 'http://localhost:63342/ProCo/build/' при сборке
            config.common.facebookAppId = '518819781624579';
            config.common.awsEnabled = true;
            config.common.buildStatus = 'dev';
            return this;
        },
        test: function() {
            config.common.home = 'http://test.testix.me/';
            config.common.facebookAppId = '515132035326687';
            config.common.awsEnabled = true;
            config.common.buildStatus = 'test';
            return this;
        },
        prod: function () {
            config.common.home = 'http://testix.me/';
            config.common.facebookAppId = '1734391910154130';
            config.common.awsEnabled = true;
            config.common.buildStatus = 'prod';
            return this;
        },
        offline: function() {
            config.common.awsEnabled = false;
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
         * {{js_product_environment}} заменяется при билде в gulpfile
         */
        configurationSetsOnStart: ["{{js_product_environment}}"], //dev test prod
        /**
         * 'prod' | 'test' | 'dev'
         *  @type {string}
         */
        buildStatus: undefined,
        /**
         * Версия сборки, указывается в gulp файле вручную
         */
        jsBuildHash: "{{js_product_version}}",
        /**
         * хост для загрузки прототипов на редактирование
         * используется для локальной разрботки, чтобы получить достйп к iframe и не вызвать sequrity error
         * При деплое на продакш оставить пустым
         */
        devPrototypesHostName: null,
        /**
         * Проводить ли при старте инициализацию для работы с хранилищем амазона
         */
        awsEnabled: true,
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
        awsRoleArn: 'arn:aws:iam::520270155749:role/Cognito_TestixIdentityPoolAuth_Role',
        // obsolete facebook arn value 'arn:aws:iam::520270155749:role/ProCo_FBUsers'
        awsRegion: 'eu-central-1', //'us-east-1'
        awsUserPoolId: 'eu-central-1_jYfT2ZhfI',
        awsIdentityPoolId: 'eu-central-1:c84ab2e1-6dc2-4362-8320-e438773c41db',
        awsUserPoolClientId: '7e0ml3f1ienelt84691dmsgpij', // client 'Testix Localhost' in region eu-central-1
        /**
         * Включить таймер который периодически рефрешит сессию
         */
        awsSessionRefreshTimerEnabled: false,
        /**
         * Период таймера с которым проверяется что надобы обновить сессию
         * Сессию мы обновляем 'in advance' - не ждем наступления еррора
         */
        awsSessionCheckTimout: 60000, // 1 min
        /**
         * Принудительное обновление сессии наступает через этот период по таймеру
         */
        awsSessionUpdatePeriod: 1800000, // 30 min
        /**
         * Задержка перед возможностью релогина
         * Применяется когда сессия устаревает
         */
        RELOGIN_DELAY: 60000, // 1 min
        /**
         * Максимальное время на выполнение задачи по загрузке изображения в bucket
         * s3util
         */
        imageUploadToAWSMaxWaitTime: 15000,
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
        editorIsUnderConstructionWhitelist: ['43d927ad-17a1-4d07-84c2-c273dff1a831'],
        /**
         * Не отправлять программные события для этих пользователей
         * При условии, что они залогинены конечно
         * В разных приложениях/доменах ид пользователя может быть разный
         */
        excludeUsersFromStatistic: [
            '43d927ad-17a1-4d07-84c2-c273dff1a831', // grishanov.artem@gmail.com
            '188fd3ea-3387-4a49-b98b-4272f47178d5', // 2@testix.me
            '0235e985-8b92-4666-83fa-25fd85ee1072', // 1@testix.me
            'cd811f5b-78b5-447c-955f-f08846862693', // txy@yandex.ru
            '895e73f9-e078-453e-a4f9-8a6b349091b1' // chemodanov2003@mail.ru
        ],
        /**
         * Хост для опубликованных проектов
         */
        publishedProjectsHostName: '//p.testix.me/',
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
        autoShareImageFileName: 'share_auto.jpg',
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
        //shareImagesAppPropertyString: 'appConstructor=mutapp _shareEntities.{{id}}.imgUrl',
        /**
         * Шаблон для кода встраивания
         */
        embedCodeTemplate: '<div class="testix_project" data-width="{{width}}" data-height="{{height}}" data-published="{{published}}"{{custom_attributes}}><script src="//testix.me/js/loader.js" async></script></div>'
        /**
         * Показывать нотификацию о помощи в моих проектах
         * Во время перехода с одной версии на другую
         */
//        showHelpNotificationInMyProjects_12_2017: true
    },
    tariff: {
        /**
         * Веса тарифов.
         * Нужны для того, чтобы определять что более высокий тариф включает в себя меньший тариф (basic < enterprise)
         */
        weights: {
            basic: 1,
            business: 5,
            enterprise: 10
        }
    },
    storage: {
        /**
         * Максимальное время которое может занять аплоад нового ресурса, картинки
         */
        putNewResourceMaxDelay: 24000,
        /**
         * Сколько по времени можем ждать ответа от сервисов типа aws
         * для аплоада оно может быть увеличено, так как там большие файлы могут быть
         */
        responseMaxDuration: 8000
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
            trivia: {
                // шаблоны встроены прямо в верстку, НЕ создаются программно
                enabled: true,
                typeLabel: {EN:'Trivia',RU:'Тесты «Проверь себя»'},
                entities: [
                    {
                        name: {EN:'Simple Trivia',RU:'Простой Тривиа'},
                        img: 'http://p.testix.me/storefront/trivia/Cover-Trivia-Simple.jpg',
                        published: 'http://p.testix.me/storefront/trivia/5cf03a1d61/p_index.html',
                        template: 'http://p.testix.me/storefront/trivia/5cf03a1d61.txt',
                        width: '800px',
                        height: '600px'
                    },
                    {
                        name: {EN:'Simple Trivia with picture',RU:'Простой Тривиа с картинкой'},
                        img: 'http://p.testix.me/storefront/trivia/Cover-Trivia-Simple-Black.jpg',
                        published: 'http://p.testix.me/storefront/trivia/0c5710c9a5/p_index.html',
                        template: 'http://p.testix.me/storefront/trivia/0c5710c9a5.txt',
                        width: '800px',
                        height: '600px'
                    },
                    {
                        name: {EN:'Books',RU:'Книга по цитате'},
                        img: 'http://p.testix.me/storefront/trivia/Trivia-Books.jpg',
                        published: 'http://p.testix.me/storefront/trivia/2dc078e94e/p_index.html',
                        template: 'http://p.testix.me/storefront/trivia/2dc078e94e.txt',
                        width: '800px',
                        height: '600px'
                    },
                    {
                        name: {EN:'Geography',RU:'География'},
                        img: 'http://p.testix.me/storefront/trivia/Trivia-Geography.jpg',
                        published: 'http://p.testix.me/storefront/trivia/b2c0c99dbc/p_index.html',
                        template: 'http://p.testix.me/storefront/trivia/b2c0c99dbc.txt',
                        width: '800px',
                        height: '600px'
                    },
                    {
                        name: {EN:'Russian',RU:'Русский язык'},
                        img: 'http://p.testix.me/storefront/trivia/Trivia-Russian.jpg',
                        published: 'http://p.testix.me/storefront/trivia/9c0691210a/p_index.html',
                        template: 'http://p.testix.me/storefront/trivia/9c0691210a.txt',
                        width: '800px',
                        height: '600px'
                    },
                    {
                        name: {EN:'Artists',RU:'Художники'},
                        img: 'http://p.testix.me/storefront/trivia/Trivia-Artists.jpg',
                        published: 'http://p.testix.me/storefront/trivia/a280eed0ab/p_index.html',
                        template: 'http://p.testix.me/storefront/trivia/a280eed0ab.txt',
                        width: '800px',
                        height: '600px'
                    },
                    {
                        name: {EN:'Presidents',RU:'Президенты'},
                        img: 'http://p.testix.me/storefront/trivia/Trivia-Presidents.jpg',
                        published: 'http://p.testix.me/storefront/trivia/289066a120/p_index.html',
                        template: 'http://p.testix.me/storefront/trivia/289066a120.txt',
                        width: '800px',
                        height: '600px'
                    }
                ]
            },
            personality: {
                // шаблоны встроены прямо в верстку, НЕ создаются программно
                enabled: true,
                typeLabel: {EN:'Personality',RU:'Тесты «Узнай себя»'},
                entities: [
                    {
                        name: {EN:'First Personality',RU:'Мой первый тест «Узнай себя»'},
                        img: 'http://p.testix.me/storefront/personality/Cover-Personality-Simple.jpg',
                        published: 'http://p.testix.me/storefront/personality/7782ade9f9/p_index.html',
                        template: 'http://p.testix.me/storefront/personality/7782ade9f9.txt',
                        width: '800px',
                        height: '600px'
                    },
                    {
                        name: {EN:'Travel',RU:'Путешествия'},
                        img: 'http://p.testix.me/storefront/personality/Personality-Travel.jpg',
                        published: 'http://p.testix.me/storefront/personality/8a2e558523/p_index.html',
                        template: 'http://p.testix.me/storefront/personality/8a2e558523.txt',
                        width: '800px',
                        height: '600px'
                    },
                    {
                        name: {EN:'Money',RU:'Любят ли вас деньги'},
                        img: 'http://p.testix.me/storefront/personality/Personality-Money.jpg',
                        published: 'http://p.testix.me/storefront/personality/e9dad5f64f/p_index.html',
                        template: 'http://p.testix.me/storefront/personality/e9dad5f64f.txt',
                        width: '800px',
                        height: '600px'
                    },
                    {
                        name: {EN:'Friends',RU:'Душа компании'},
                        img: 'http://p.testix.me/storefront/personality/Personality-Friends.jpg',
                        published: 'http://p.testix.me/storefront/personality/1b640802c6/p_index.html',
                        template: 'http://p.testix.me/storefront/personality/1b640802c6.txt',
                        width: '800px',
                        height: '600px'
                    }
                ]
            },
            memoriz: {
                enabled: true,
                typeLabel: {EN:'Memory Game',RU:'Игра мемори'},
                entities: [
//                    {
//                        //Интернет мемы http://p.testix.me/1045302892173346/13e4d14521/
//                        name: {RU:'Интернет-мемы',EN:'Online memes'},
//                        img: 'http://p.testix.me/storefront/memoriz/13e4d14521.jpg',
//                        published: 'http://p.testix.me/storefront/memoriz/13e4d14521/p_index.html',
//                        template: 'storefront/memoriz/13e4d14521.txt',
//                        width: '800px',
//                        height: '600px'
//                    },
                    {
                        //Футболисты http://p.testix.me/1045302892173346/53b37bf1e9
                        name: {RU:'Футболисты',EN:'Soccer players'},
                        img: 'http://p.testix.me/storefront/memoriz/Memori-Football-18.jpg',
                        published: 'http://p.testix.me/storefront/memoriz/f720897024/p_index.html',
                        template: 'http://p.testix.me/storefront/memoriz/f720897024.txt',
                        width: '800px',
                        height: '600px'
                    },
//                    {
//                        //Фильмы и режиссеры  http://p.testix.me/121947341568004/6842f5cd6d/
//                        name: {RU:'Кино и режиссеры',EN:'Movies and directors'},
//                        img: 'http://p.testix.me/storefront/memoriz/6842f5cd6d.jpg',
//                        published: 'http://p.testix.me/storefront/memoriz/6842f5cd6d/p_index.html',
//                        // in proconstructor/storefront/memoriz
//                        template: 'storefront/memoriz/6842f5cd6d.txt',
//                        width: '800px',
//                        height: '600px'
//                    },
                    {
                        //Автомобили
                        name: {RU:'Автомобили',EN:'Cars'},
                        img: 'http://p.testix.me/storefront/memoriz/Memori-Cars-12.jpg',
                        published: 'http://p.testix.me/storefront/memoriz/5ae1ea7514/p_index.html',
                        template: 'http://p.testix.me/storefront/memoriz/5ae1ea7514.txt',
                        width: '800px',
                        height: '600px'
                    },
                    {
                        //Красотки
                        name: {RU:'Красотки',EN:'Beauty'},
                        img: 'http://p.testix.me/storefront/memoriz/Memori-Girls-10.jpg',
                        published: 'http://p.testix.me/storefront/memoriz/47ccfd9ec8/p_index.html',
                        template: 'http://p.testix.me/storefront/memoriz/47ccfd9ec8.txt',
                        width: '800px',
                        height: '600px'
                    }
                ]
            },
            panorama: {
                typeLabel: {EN:'Panoramas',RU:'Панорамы'},
                enabled: false,
                entities: [
                    {
                        //Сингапур http://p.testix.me/121947341568004/3396d27281/               deprecated: http://p.testix.me/121947341568004/1d1f4f3236/
                        name: {RU:'Сингапур',EN:'Singapore'},
                        img: 'http://p.testix.me/storefront/panorama/3396d27281.jpg',
                        published: 'http://p.testix.me/storefront/panorama/3396d27281/p_index.html',
                        // in proconstructor/storefront/panorama
                        template: 'storefront/panorama/3396d27281.txt',
                        width: '800px',
                        height: '600px',
                        getParams: 'appStorage=ref:strf',
                        appName: 'fbPanorama' // информация о типе приложения важна для ембеда, могут использоваться доп атрибуты, например мелкие иконки для панорам
                    }
                ]
            },
            fbPanorama: {
                typeLabel: {EN:'Facebook panorama',RU:'Facebook панорама'},
                enabled: true,
                entities: [
                    {
                        name: {RU:'Римские руины',EN:'Roman ruins'},
                        img: 'http://p.testix.me/storefront/fbPano/46f459ce11.jpg',
                        published: null,
                        externalLink: 'https://www.facebook.com/photo.php?fbid=266745550421515&set=a.256225194806884.1073741833.100012582155261&type=3&theater',
                        template: 'http://p.testix.me/storefront/fbPano/46f459ce11.txt',
                        width: '800px',
                        height: '600px',
                        getParams: 'appStorage=ref:strf',
                        appName: 'fbPanorama'
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
            defaultShareImageRecommendedSize: '1200x620',
            publishResources: [
                {
                    // ex: products/trivia/
                    baseUrl: undefined, // не указана, значит будет установлена publisher.js
                    // index.html промо проекта
                    url: 'index.html',
                    destUrl: 'p_index.html',
                    type: 'text/html',
                    // замена подстроки в этом файле при публикации
                    replace: [{
                        // только для публикации с dev+pub, иначе замены просто не будет
                        from: '<script type="text/javascript" src="../common/js/jquery.js"></script>',
                        to: '<script type="text/javascript" src="jquery.js"></script>'
                    },
                    {
                        // только для публикации с dev+pub, иначе замены просто не будет
                        from: '<script type="text/javascript" src="../common/js/underscore.js"></script>',
                        to: '<script type="text/javascript" src="underscore.js"></script>'
                    },
                    {
                        // только для публикации с dev+pub, иначе замены просто не будет
                        from: '<script type="text/javascript" src="../common/js/backbone.js"></script>',
                        to: '<script type="text/javascript" src="backbone.js"></script>'
                    },
                    {
                        // только для публикации с dev+pub, иначе замены просто не будет
                        from: '<script type="text/javascript" src="../common/js/mutapp.js"></script>',
                        to: '<script type="text/javascript" src="mutapp.js"></script>'
                    },
                    {
                        // только для публикации с dev+pub, иначе замены просто не будет
                        from: '<link href="../common/css/tstx_cmn_products.css" rel="stylesheet">',
                        to: '<link href="tstx_cmn_products.css" rel="stylesheet">'
                    },
                    {
                        from: '../common/js/lib.js',
                        to: 'lib.js'
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
                    // стили сайта для анонимной страницы
                    baseUrl: '', // not needed
                    // url: 'css/common.css', for pub
                    url: 'css/style.css', // for build
                    destUrl: 'common.css',
                    type: 'text/css'
                },
//                dont need for build
//                {
//                    baseUrl: '', // not needed
//                    url: 'products/common/css/tstx_cmn_products.css',
//                    destUrl: 'tstx_cmn_products.css',
//                    type: 'text/css'
//                },
                {
                    baseUrl: '',
//                    url: 'products/common/js/mutapp.js', for pub
                    url: 'products/common/js/lib.js',
//                    destUrl: 'mutapp.js',
                    destUrl: 'lib.js',
                    type: 'text/javascript'
                },
                {
                    // Для публикации: основной код продукта
                    baseUrl: undefined, // in that case 'baseProductUrl' will be set in publisher.js
                    url: 'app.js',
                    destUrl: 'app.js',
                    type: 'text/javascript'
                },
                {
                    // Для публикации: основные стили продукта
                    baseUrl: undefined, // in that case 'baseProductUrl' will be set in publisher.js
                    url: 'style.css',
                    destUrl: 'style.css',
                    type: 'text/css'
                }
            ]
        },
        // конфигурация для каждого типа промо-приложений
        trivia: {
            prototypeId: 'test_v1.0',
            /**
             * Имя функции с помощью которой создается приложение этого типа
             */
            constructorName: 'TriviaApp',
            /**
             * Само приложение для загрузки через iframe
             */
            src: 'products/trivia/index.html',
            /**
             * В зависимости от открытого промо проекта надо уметь вот так возвращать ссылку на его стили, чтобы встроить их в ifrmae
             * Нужно для превью в контроле Slide
             */
            stylesForEmbed: '<link href="{{config.common.home}}products/trivia/style.css" rel="stylesheet"/>',
            /**
             * каталог откуда publisher будет брать все ресурсы для публикации проекта
             */
            baseProductUrl: 'products/trivia/',
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
        personality: {
            prototypeId: 'personality_v1.0',
            /**
             * Имя функции с помощью которой создается приложение этого типа
             */
            constructorName: 'PersonalityApp',
            /**
             * Само приложение для загрузки через iframe
             */
            src: 'products/personality/index.html',
            /**
             * В зависимости от открытого промо проекта надо уметь вот так возвращать ссылку на его стили, чтобы встроить их в ifrmae
             * Нужно для превью в контроле Slide
             */
            stylesForEmbed: '<link href="{{config.common.home}}products/personality/style.css" rel="stylesheet"/>',
            /**
             * каталог откуда publisher будет брать все ресурсы для публикации проекта
             */
            baseProductUrl: 'products/personality/',
            /**
             * Ширина по умолчанию, если не задана
             */
            defaultWidth: 800,
            /**
             * Высота по умолчанию, если не задана
             */
            defaultHeight: 600,
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
            stylesForEmbed: '<link href="{{config.common.home}}products/memoriz/style.css" rel="stylesheet"/>',
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
            stylesForEmbed: '<link href="{{config.common.home}}products/fbPanorama/style.css" rel="stylesheet"/>',
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
            /**
             * Дополнительные атрибуты для этого типа проекта, которые надо встроить в ембед код. Publisher.getEmbedCode()
             */
            customEmbedCodeAttributes: 'data-icon-mod="__small"',
            /**
             * Скрыть верхнюю панель с экранами
             */
            hideScreenControls: true,
            /**
             * Скрыть превью с помощью эмулятора телефона
             * Для FB пано нет смысла в этом. Выглядеть будет все равно не так как в Fb
             */
            mobPreviewEnabled: false
        },
        timeline: {
            stylesForEmbed: '<link href="{{config.common.home}}products/timeline/style.css" rel="stylesheet"/>'
        },
        smartimage: {
            stylesForEmbed: '<link href="{{config.common.home}}products/smartimage/style.css" rel="stylesheet"/>'
        },
        photostory: {
            prototypeId: 'photostory_v1.0',
            /**
             * Имя функции с помощью которой создается приложение этого типа
             */
            constructorName: 'PhotostoryApp',
            /**
             * Само приложение для загрузки через iframe
             */
            src: 'products/photostory/index.html',
            /**
             * В зависимости от открытого промо проекта надо уметь вот так возвращать ссылку на его стили, чтобы встроить их в ifrmae
             * Нужно для превью в контроле Slide
             */
            stylesForEmbed: '<link href="{{config.common.home}}products/photostory/style.css" rel="stylesheet"/>',
            /**
             * каталог откуда publisher будет брать все ресурсы для публикации проекта
             */
            baseProductUrl: 'products/photostory/',
            /**
             * Ширина по умолчанию, если не задана
             */
            defaultWidth: 800, // по дизайну для десктопа. чуть больше чем 600 (это малая ширина уже идет в mutapp)
            /**
             * Высота по умолчанию, если не задана
             */
            defaultHeight: 600
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
        AddDictionaryElementControl: {
            defaultDirectiveIndex: 0,
            directives: ['addquickbutton','addscreenbutton'],
            parentId: 'id-control_cnt',
            type: 'quickcontrolpanel' // контрол появляется на всплывающей панельке рядом с элементом
        },
        DeleteDictionaryElementControl: {
            defaultDirectiveIndex: 0,
            directives: ['deletequickbutton'],
            parentId: 'id-control_cnt',
            type: 'quickcontrolpanel', // контрол появляется на всплывающей панельке рядом с элементом
            sortIndex: 8 // индекс сортировки по умолчанию, чем больше значение, тем ниже будет располагаться в списке контрол
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
            directives: ['chooseimage'],
            parentId: 'id-static_controls_cnt',
            type: 'controlpanel'
        },
        ChooseSharingImage: {
            defaultDirectiveIndex: 0,
            directives: ['choosesharingimage'],
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
        // custom control
        PersonalityResultLinking: {
            defaultDirectiveIndex: 0,
            directives: ['personalityresultlinking'],
            parentId: 'id-popup_controls_cnt',
            type: 'popup'
        },
        // custom control
        TriviaOptionPoints: {
            defaultDirectiveIndex: 0,
            directives: ['triviaoptionpoints'],
            parentId: null,//'id-popup_controls_cnt',
            type: 'quickcontrolpanel'
        },
        // custom control
        TriviaTextFeedback: {
            defaultDirectiveIndex: 0,
            directives: ['triviatextfeedback'],
            parentId: 'id-popup_controls_cnt',
            type: 'popup',
            quickControlPanelBtn: true // значит что перед тем как показать popup, у элемента всплывет quick-панелька с опцией, кликнув на кнопку в панельке уже откроется popup
        },
        // custom control
        PanoramaAddSticker: {
            defaultDirectiveIndex: 0,
            directives: ['panoramaaddsticker'],
            parentId: 'id-control_cnt',
            type: 'workspace'
        }
    },
    editor: {
        ui: {
            /**
             * Видимая ширина приложение при редактировании в редакторе. Если приложение становится шире, то будет горизонтальная прокрутка
             * В pub/css/editor.css за это отвечает .product_wr
             */
            productWrapperWidth: 800,
            /**
             * Примерная ширина скролбара
             * Чтобы прибавить эту величину к высоте контейнера, чтобы не появилась прокрутка по вертикали
             */
            scrollBarHeight: 20,
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
             * z-index панели быстрого редактирования, которая всплывает рядом с элементом и указывает на него
             */
            quickControlPanelZIndex: 22,
            /**
             * z-index топ-бара (где кнопка опубликовать)
             * программно не ставится, только в css
             */
            topZIndex: 25,
            /**
             * z-index id-modal_cnt
             * программно не ставится, только в css .modal_cnt
             */
            modalCntZIndex: 26,
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
            id_product_cnt_additional_height: 60,
            /**
             * Длительность интервала для вызова автосохранения
             */
            autoSaverTimerInterval: 10000, // ms
            /**
             * Индекс группы по умолчанию, применяется для сортировки и упорядочивания элементов меню quickpanel
             */
            quickPanelDefaultSortIndex: 0
        },
        hooks: {
            /**
             * Максимальное время ожидание выполнения хука
             * больше стандартного, так как есть задачи по аплоаду картинок например перед превью
             */
            maxWaitTimeInQueue: 10000,
            /**
             * Имена доступных хуков, которые может определить пользователь
             */
            hookNames: ['beforePreview', 'afterPreview']
        },
        imageGeneration: {
            /**
             * Столько времени актуальным считает автосгенерированный канвас в приложении
             * Используется в shareImageService
             */
            appAutoPreviewImageExpirationTimeMillis: 3000
        },
        resourceManager: {
            /**
             * Для превьюшек используется такой префикс в имени файла
             */
            thumbPrefix: 'thumb__',
            /**
             * Ширина превьюшки для леера resourceManager
             */
            thumbWidth: 210,
            /**
             * Высота превьюшки для леера resourceManager
             */
            thumbHeight: 130
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
        },
        signupModal: {
            templateUrl: 'templates/signup.html',
            defZIndex: 95
        },
        signinModal: {
            templateUrl: 'templates/signin.html',
            defZIndex: 95
        },
        emailSentModal: {
            templateUrl: 'templates/emailSent.html',
            defZIndex: 95
        },
        changePasswordModal: {
            templateUrl: 'templates/changePasswordModal.html',
            defZIndex: 95
        },
        restorePasswordModal: {
            templateUrl: 'templates/restorePasswordModal.html',
            defZIndex: 95
        },
        notificationInMyProjects12_2017Modal: {
            templateUrl: 'templates/my_projects_notif_12_2017.html',
            defZIndex: 95
        },
        signup12_2017Modal: {
            templateUrl: 'templates/signup_12_2017.html',
            defZIndex: 95
        }
    },
    scripts: {
        // '22.03.2017' - при быстром закрытии страницы такой "умный" способ вставки кода не успевает работать и конверсия не считается.
        ga: {
            enabled: false,
            code: '<script>(function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,"script","https://www.google-analytics.com/analytics.js","ga");ga("create", "UA-88595022-1", "auto");ga("send", "pageview");</script>'
        },
        // '12.03.2017' - начало эксперимента по статичной вставке кода. Так как веб-визор иногда отказывается работать.
        yaMetrika: {
            enabled: false,
            code: '<!-- Yandex.Metrika counter --><script type="text/javascript">(function (d, w, c) {(w[c] = w[c] || []).push(function() {try {w.yaCounter37720792 = new Ya.Metrika({id:37720792,clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});} catch(e) { }});var n = d.getElementsByTagName("script")[0],s = d.createElement("script"),f = function () { n.parentNode.insertBefore(s, n); };s.type = "text/javascript";s.async = true;s.src = "https://mc.yandex.ru/metrika/watch.js";if (w.opera == "[object Opera]") {d.addEventListener("DOMContentLoaded", f, false);} else { f(); }})(document, window, "yandex_metrika_callbacks");</script><noscript><div><img src="https://mc.yandex.ru/watch/37720792" style="position:absolute; left:-9999px;" alt="" /></div></noscript><!-- /Yandex.Metrika counter -->'
        },
        /**
         * Сервис плохо себя показал, отключаем
         */
        jivoSite: {
            enabled: false,
            code: '<!-- BEGIN JIVOSITE CODE {literal} --><script type=\'text/javascript\'>(function(){ var widget_id = \'45oOHsZGmj\';var d=document;var w=window;function l(){var s = document.createElement(\'script\'); s.type = \'text/javascript\'; s.async = true; s.src = \'//code.jivosite.com/script/widget/\'+widget_id; var ss = document.getElementsByTagName(\'script\')[0]; ss.parentNode.insertBefore(s, ss);}if(d.readyState==\'complete\'){l();}else{if(w.attachEvent){w.attachEvent(\'onload\',l);}else{w.addEventListener(\'load\',l,false);}}})();</script><!-- {/literal} END JIVOSITE CODE -->'
        },
        facebook_chat_widget: {
            enabled: true,
            code: '<!-- facebook messenger widget --><style>.fb-livechat,.fb-widget{display:none}.ctrlq.fb-button,.ctrlq.fb-close{position:fixed;right:24px;cursor:pointer}.ctrlq.fb-button{z-index:1;background:url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDEyOCAxMjgiIGhlaWdodD0iMTI4cHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAxMjggMTI4IiB3aWR0aD0iMTI4cHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxnPjxyZWN0IGZpbGw9IiMwMDg0RkYiIGhlaWdodD0iMTI4IiB3aWR0aD0iMTI4Ii8+PC9nPjxwYXRoIGQ9Ik02NCwxNy41MzFjLTI1LjQwNSwwLTQ2LDE5LjI1OS00Niw0My4wMTVjMCwxMy41MTUsNi42NjUsMjUuNTc0LDE3LjA4OSwzMy40NnYxNi40NjIgIGwxNS42OTgtOC43MDdjNC4xODYsMS4xNzEsOC42MjEsMS44LDEzLjIxMywxLjhjMjUuNDA1LDAsNDYtMTkuMjU4LDQ2LTQzLjAxNUMxMTAsMzYuNzksODkuNDA1LDE3LjUzMSw2NCwxNy41MzF6IE02OC44NDUsNzUuMjE0ICBMNTYuOTQ3LDYyLjg1NUwzNC4wMzUsNzUuNTI0bDI1LjEyLTI2LjY1N2wxMS44OTgsMTIuMzU5bDIyLjkxLTEyLjY3TDY4Ljg0NSw3NS4yMTR6IiBmaWxsPSIjRkZGRkZGIiBpZD0iQnViYmxlX1NoYXBlIi8+PC9zdmc+) center no-repeat #0084ff;width:60px;height:60px;text-align:center;bottom:24px;border:0;outline:0;border-radius:60px;-webkit-border-radius:60px;-moz-border-radius:60px;-ms-border-radius:60px;-o-border-radius:60px;box-shadow:0 1px 6px rgba(0,0,0,.06),0 2px 32px rgba(0,0,0,.16);-webkit-transition:box-shadow .2s ease;background-size:80%;transition:all .2s ease-in-out}.ctrlq.fb-button:focus,.ctrlq.fb-button:hover{transform:scale(1.1);box-shadow:0 2px 8px rgba(0,0,0,.09),0 4px 40px rgba(0,0,0,.24)}.fb-widget{background:#fff;z-index:2;position:fixed;width:360px;height:435px;overflow:hidden;opacity:0;bottom:0;right:24px;border-radius:6px;-o-border-radius:6px;-webkit-border-radius:6px;box-shadow:0 5px 40px rgba(0,0,0,.16);-webkit-box-shadow:0 5px 40px rgba(0,0,0,.16);-moz-box-shadow:0 5px 40px rgba(0,0,0,.16);-o-box-shadow:0 5px 40px rgba(0,0,0,.16)}.fb-credit{text-align:center;margin-top:8px}.fb-credit a{transition:none;color:#bec2c9;font-family:Helvetica,Arial,sans-serif;font-size:12px;text-decoration:none;border:0;font-weight:400}.ctrlq.fb-overlay{z-index:0;position:fixed;height:100vh;width:100vw;-webkit-transition:opacity .4s,visibility .4s;transition:opacity .4s,visibility .4s;top:0;left:0;background:rgba(0,0,0,.05);display:none}.ctrlq.fb-close{z-index:4;padding:0 6px;background:#365899;font-weight:700;font-size:11px;color:#fff;margin:8px;border-radius:3px}.ctrlq.fb-close::after{content:\'x\';font-family:sans-serif}</style><div class="fb-livechat"><div class="ctrlq fb-overlay"></div><div class="fb-widget"><div class="ctrlq fb-close"></div><div class="fb-page" data-href="https://www.facebook.com/testixme/" data-tabs="messages" data-width="360" data-height="400" data-small-header="true" data-hide-cover="true" data-show-facepile="false"><blockquote cite="https://www.facebook.com/testix.me/" class="fb-xfbml-parse-ignore"> </blockquote></div><div class="fb-credit"><a href="http://testix.me" target="_blank">Facebook Chat Widget by Testix</a></div><div id="fb-root"></div></div><a href="https://m.me/testix.me" title="Send us a message on Facebook" class="ctrlq fb-button"></a></div><script src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.9"></script><script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script><script>$(document).ready(function(){var t={delay:125,overlay:$(".fb-overlay"),widget:$(".fb-widget"),button:$(".fb-button")};setTimeout(function(){$("div.fb-livechat").fadeIn()},8*t.delay),$(".ctrlq").on("click",function(e){e.preventDefault(),t.overlay.is(":visible")?(t.overlay.fadeOut(t.delay),t.widget.stop().animate({bottom:0,opacity:0},2*t.delay,function(){$(this).hide("slow"),t.button.show()})):t.button.fadeOut("medium",function(){t.widget.stop().show().animate({bottom:"30px",opacity:1},2*t.delay),t.overlay.fadeIn(t.delay)})})});</script><!-- facebook messenger widget -->'
        }
    }
};

// применение конфигураций по умолчанию
if (config.common.configurationSetsOnStart && config.common.configurationSetsOnStart.length > 0) {
    for (var i = 0; i < config.common.configurationSetsOnStart.length; i++) {
        var setName = config.common.configurationSetsOnStart[i];
        // Нормализуем значение environment, возможно мы запускаем не сбилденный проект и там стоит {{js product environment}}
        if (setName !== 'dev' && setName !== 'test' && setName !== 'prod') {
            setName = 'dev';
        }
        config.congigurationSet[setName].call(this);
    }
}

config.products.common.styles = config.products.common.styles.replace('{{config.common.home}}',config.common.home);
for (var key in config.products) {
    if (config.products[key].stylesForEmbed) {
        config.products[key].stylesForEmbed = config.products[key].stylesForEmbed.replace('{{config.common.home}}',config.common.home);
    }
}
$('.js-version_hash').text(config.common.jsBuildHash);